import type { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'experimental-edge';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { packedPuzzle, solution } = req.body;

  console.info('Received Request:', { packedPuzzle, solution });

  if (!packedPuzzle || !solution) {
    return res
      .status(400)
      .json({ error: 'Packed puzzle and solution are required' });
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

    if (response.status !== 200) {
      throw new Error(`Sindri API responded with status ${response.status}`);
    }

    const proofResult = await response.json();

    console.log('Proof result:', JSON.stringify(proofResult, null, 2));

    if (proofResult) {
      console.info('Proof successfully generated');
      return res.status(200).json({ proof: JSON.stringify(proofResult) });
    } else {
      console.error('Failed to generate proof');
      return res.status(500).json({ error: 'Failed to generate proof' });
    }
  } catch (error) {
    console.error('Error during proof generation:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack available'
    );
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      stack: error instanceof Error ? error.stack : 'No stack available',
    });
  }
}
