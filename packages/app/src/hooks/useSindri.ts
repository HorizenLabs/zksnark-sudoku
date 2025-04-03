import { useState } from 'react';

export function useSindri() {
    const [proofGenerating, setProofGenerating] = useState(false);
    const [proof, setProof] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string | null>(null);

    const generateProof = async (packedPuzzle: bigint[], solution: number[]) => {
        setProofGenerating(true);
        setError(null);
        setLogs(null);

        try {
            const puzzleStr = packedPuzzle.map(num => num.toString());

            console.log('Sending request to /api/sindri with payload:', { packedPuzzle: puzzleStr, solution });

            const response = await fetch('/api/sindri', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ packedPuzzle: puzzleStr, solution }),
            });

            const data = await response.json();

            console.log('API Response Data:', data);

            if (!response.ok) {
                console.error('Error from API:', data.error);
                throw new Error(data.error || 'Failed to generate proof.');
            }

            setProof(JSON.stringify(data.proof));
            setLogs(data.logs);
            console.log('Logs from API:', data.logs);

        } catch (err) {
            console.error('Error in useSindri hook:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setProofGenerating(false);
        }
    };

    return { proofGenerating, proof, error, logs, generateProof };
}
