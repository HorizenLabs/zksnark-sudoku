import { useState } from 'react';

export function useSindri() {
    const [proofGenerating, setProofGenerating] = useState(false);
    const [proof, setProof] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateProof = async (packedPuzzle: bigint[], solution: number[]) => {
        setProofGenerating(true);
        setError(null);

        try {
            const puzzleStr = packedPuzzle.map(num => num.toString());

            const response = await fetch('/api/sindri', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ packedPuzzle: puzzleStr, solution }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate proof.');
            }

            const data = await response.json();
            setProof(JSON.stringify(data.proof));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setProofGenerating(false);
        }
    };

    return { proofGenerating, proof, error, generateProof };
}
