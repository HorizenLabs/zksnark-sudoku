export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const CIRCUIT_IDENTIFIER = 'zksnarks-sudoku-zkverify:latest';
const MAX_POLLING_ATTEMPTS = 10;
const POLLING_INTERVAL = 5000;

export default async function handler(req: NextRequest): Promise<Response> {
  let logs = '';

  logs += 'Starting API handler...\n';

  const SINDRI_API_KEY = process.env.SINDRI_API_KEY;

  logs += `SINDRI_API_KEY (first 8 chars): ${SINDRI_API_KEY?.slice(0, 8) || 'Not Set'}\n`;

  try {
    logs += `Incoming Request: ${req.method} ${req.url}\n`;

    const bodyText = await req.text();
    logs += `Request Body Text: ${bodyText}\n`;

    let packedPuzzle, solution;

    try {
      ({ packedPuzzle, solution } = JSON.parse(bodyText));
    } catch (error) {
      logs += `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
      return new NextResponse(JSON.stringify({ error: 'Invalid JSON', logs }), { status: 400 })
    }

    if (!packedPuzzle || !solution) {
      logs += 'Invalid request body: Packed puzzle or solution missing\n';
      return new NextResponse(
          JSON.stringify({ error: 'Packed puzzle and solution are required', logs }),
          { status: 400 }
      );
    }

    const requestBody = {
      proof_input: JSON.stringify({ packedPuzzle, solution }),
      perform_verify: true,
    };

    logs += 'Sending request to Sindri API...\n';

    const proveResponse = await fetch(
        `https://sindri.app/api/v1/circuit/${CIRCUIT_IDENTIFIER}/prove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SINDRI_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
    );

    logs += `Sindri Response Status: ${proveResponse.status}\n`;

    const responseText = await proveResponse.text();
    logs += `Sindri Response Text: ${responseText}\n`;

    if (!proveResponse.ok) {
      return new NextResponse(JSON.stringify({ error: `Sindri API Error: ${responseText}`, logs }), { status: 500 })
    }

    const responseBody = JSON.parse(responseText);
    const { proof_id: proofId } = responseBody;

    logs += `Proof ID: ${proofId}\n`;

    const finalProof = await pollForProof(proofId, logs);

    logs += `Final Proof: ${JSON.stringify(finalProof)}\n`;

    return new NextResponse(JSON.stringify({ proof: finalProof, logs }), { status: 200 });

  } catch (error) {
    logs += `Error during proof generation: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal Server Error', logs }), { status: 500 });
  }
}

async function pollForProof(proofId: string, logs: string): Promise<any> {
  const proofDetailUrl = `https://sindri.app/api/v1/proof/${proofId}/detail`;

  for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
    logs += `Polling attempt ${attempt + 1} for proofId: ${proofId}\n`;

    const response = await fetch(proofDetailUrl, {
      headers: {
        Authorization: `Bearer ${process.env.SINDRI_API_KEY}`,
      },
    });

    const proofDetailsText = await response.text();
    logs += `Polling Response Text: ${proofDetailsText}\n`;

    if (!response.ok) {
      logs += `Failed to fetch proof details: ${response.statusText}\n`;
      throw new Error(`Failed to fetch proof details: ${response.statusText}`);
    }

    const proofDetails = JSON.parse(proofDetailsText);

    if (proofDetails.status === 'Ready') {
      logs += `Proof successfully generated: ${JSON.stringify(proofDetails)}\n`;
      return proofDetails;
    } else if (proofDetails.status === 'Failed') {
      logs += 'Proof generation failed\n';
      throw new Error('Proof generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error('Proof generation timed out');
}
