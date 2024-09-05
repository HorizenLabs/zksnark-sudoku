export const runtime = 'edge';

const SINDRI_API_KEY = process.env.SINDRI_API_KEY;
const CIRCUIT_IDENTIFIER = 'zksnarks-sudoku-zkverify:latest';
const MAX_POLLING_ATTEMPTS = 10;
const POLLING_INTERVAL = 5000; // 5 seconds

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const bodyText = await req.text();
    const { packedPuzzle, solution } = JSON.parse(bodyText);

    if (!packedPuzzle || !solution) {
      return new Response(
        JSON.stringify({ error: 'Packed puzzle and solution are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const requestBody = {
      proof_input: JSON.stringify({ packedPuzzle, solution }),
      perform_verify: true,
    };

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

    if (!proveResponse.ok) {
      const errorDetails = await proveResponse.text();
      throw new Error(
        `Sindri API responded with status ${proveResponse.status}: ${errorDetails}`
      );
    }

    const { proof_id: proofId } = await proveResponse.json();

    // Poll for the final proof
    const finalProof = await pollForProof(proofId);

    return new Response(JSON.stringify({ proof: finalProof }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during proof generation:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function pollForProof(proofId: string): Promise<any> {
  const proofDetailUrl = `https://sindri.app/api/v1/proof/${proofId}/detail`;

  for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
    const response = await fetch(proofDetailUrl, {
      headers: {
        Authorization: `Bearer ${SINDRI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch proof details: ${response.statusText}`);
    }

    const proofDetails = await response.json();

    if (proofDetails.status === 'Ready') {
      return proofDetails;
    } else if (proofDetails.status === 'Failed') {
      throw new Error('Proof generation failed');
    }

    // Wait before the next polling attempt
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error('Proof generation timed out');
}
