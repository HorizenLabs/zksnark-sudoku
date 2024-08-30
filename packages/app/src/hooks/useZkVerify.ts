import { useState } from 'react';
import {packDigits} from "../utils/GameUtils";

export function useZkVerify(selectedAccount) {
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);

    const onVerifyProof = async (proof, puzzle, vk) => {
        setVerifying(true);
        setVerified(false);
        setError(null);

        try {
            if (typeof window === 'undefined') {
                throw new Error('This operation can only be performed in the browser.');
            }

            if (!proof || !puzzle || !vk) {
                throw new Error('Proof, puzzle data, or verification key is missing');
            }

            if (!selectedAccount) {
                throw new Error('No account connected');
            }

            const packedPuzzle = packDigits(puzzle);
            const publicSignals = ['1', ...packedPuzzle.map(p => p.toString())];
            const proofData = JSON.parse(proof);

            let zkVerifySession;
            try {
                zkVerifySession = (await import('zkverifyjs')).zkVerifySession;
            } catch (error) {
                throw new Error(`Failed to load zkVerifySession: ${error.message}`);
            }

            let session;
            try {
                session = await zkVerifySession.start().Testnet().withWallet();
            } catch (error) {
                throw new Error(`Connection failed: ${error.message}`);
            }

            const { events, transactionResult } = await session.verify()
                .groth16()
                .execute(proofData, publicSignals, vk);

            events.on('ErrorEvent', (eventData) => {
                console.error(JSON.stringify(eventData));
            });

            let transactionInfo = null;
            try {
                transactionInfo = await transactionResult;
            } catch (error) {
                throw new Error(`Transaction failed: ${error.message}`);
            }

            if (transactionInfo && transactionInfo.attestationId) {
                setVerified(true);
                return transactionInfo;
            } else {
                throw new Error("Your proof isn't correct.");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setVerifying(false);
        }
    };

    return { verifying, verified, error, onVerifyProof };
}
