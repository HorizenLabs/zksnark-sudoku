export const runtime = 'edge';

export default async function handler(req: any) {
  // Log the full request object for better inspection
  console.info('Received Full Request:', JSON.stringify(req, null, 2));

  // Manually read the request body as a stream and convert it to text
  let bodyText = await req.text(); // Read the request body as text
  console.info('Received Request Body (Text):', bodyText);

  const { packedPuzzle, solution } = req.body;

  if (!packedPuzzle || !solution) {
    return new Response(
      JSON.stringify({ error: 'Packed puzzle and solution are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const proofInput = JSON.stringify({
      packedPuzzle,
      solution,
    });

    console.info('Serialized Proof Input:', proofInput);

    const circuitIdentifier = 'zksnarks-sudoku-zkverify:latest';
    const sindriApiUrl = `https://sindri.app/api/v1/circuit/${circuitIdentifier}/prove`;

    console.log('Sending request to Sindri API...');
    const response = await fetch(sindriApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SINDRI_API_KEY}`,
      },
      body: proofInput,
    });

    if (!response.ok) {
      throw new Error(`Sindri API responded with status ${response.status}`);
    }

    const proofResult = await response.json();

    console.log('Proof result:', JSON.stringify(proofResult, null, 2));

    if (proofResult) {
      console.info('Proof successfully generated');
      return new Response(JSON.stringify({ proof: proofResult }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Failed to generate proof');
      return new Response(
        JSON.stringify({ error: 'Failed to generate proof' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error during proof generation:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack available'
    );
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
