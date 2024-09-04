import type { NextApiRequest, NextApiResponse } from 'next';
import sindri from 'sindri';

export const runtime = 'edge';

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

    const sindriClient = sindri.create(
      { apiKey: process.env.SINDRI_API_KEY },
      undefined
    );
    console.info('Sindri client created');

    const circuitIdentifier = 'zksnarks-sudoku-zkverify:latest';
    const proofResult = await sindriClient.proveCircuit(
      circuitIdentifier,
      proofInput
    );

    console.log(JSON.stringify(proofResult, null, 2));

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
