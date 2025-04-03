const SINDRI_API_KEY = process.env.SINDRI_API_KEY
console.log('Starting API handler...');
console.log('SINDRI_API_KEY:', SINDRI_API_KEY?.slice(0, 8) || 'Not Set');

const CIRCUIT_IDENTIFIER = 'zksnarks-sudoku-zkverify:latest';
const MAX_POLLING_ATTEMPTS = 10;
const POLLING_INTERVAL = 5000; // 5 seconds

export default async function handler(req: Request) {
  console.log('Incoming Request:', req.method, req.url);

  try {
    const bodyText = await req.text();
    console.log('Request Body Text:', bodyText);

    const { packedPuzzle, solution } = JSON.parse(bodyText);
    console.log('Parsed Request Body:', { packedPuzzle, solution });

    if (!packedPuzzle || !solution) {
      console.error('Invalid request body:', { packedPuzzle, solution });
      return new Response(
          JSON.stringify({ error: 'Packed puzzle and solution are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = {
      proof_input: JSON.stringify({ packedPuzzle, solution }),
      perform_verify: true,
    };

    console.log('Sending request to Sindri API...');

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

    console.log('Sindri Response Status:', proveResponse.status);

    const responseText = await proveResponse.text();
    console.log('Sindri Response Body:', responseText);

    if (!proveResponse.ok) {
      throw new Error(
          `Sindri API responded with status ${proveResponse.status}: ${responseText}`
      );
    }

    const responseBody = JSON.parse(responseText);
    const { proof_id: proofId } = responseBody;

    console.log('Proof ID:', proofId);

    const finalProof = await pollForProof(proofId);

    console.log('Final Proof:', finalProof);

    return new Response(JSON.stringify({ proof: finalProof }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during proof generation:', error);
    return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'An unknown error occurred',
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
    console.log(`Polling attempt ${attempt + 1} for proofId: ${proofId}`);

    const response = await fetch(proofDetailUrl, {
      headers: {
        Authorization: `Bearer ${SINDRI_API_KEY}`,
      },
    });

    const proofDetailsText = await response.text();
    console.log('Polling Response Body:', proofDetailsText);

    if (!response.ok) {
      throw new Error(`Failed to fetch proof details: ${response.statusText}`);
    }

    const proofDetails = JSON.parse(proofDetailsText);

    if (proofDetails.status === 'Ready') {
      console.log('Proof successfully generated:', proofDetails);
      return proofDetails;
    } else if (proofDetails.status === 'Failed') {
      console.error('Proof generation failed');
      throw new Error('Proof generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error('Proof generation timed out');
}
