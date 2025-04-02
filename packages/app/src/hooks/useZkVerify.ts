import { useState } from 'react';
import { packDigits } from '../utils/GameUtils';
import { useAccount } from "../contexts/AccountContext";
import { CurveType, Library } from "zkverifyjs";

export function useZkVerify() {
  const { selectedAccount, selectedWalletSource } = useAccount();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onVerifyProof = async (proof: string, puzzle: number[], vk: any) => {
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
      const publicSignals = ['1', ...packedPuzzle.map((p) => p.toString())];
      const proofData = JSON.parse(proof);

      let zkVerifySession;
      try {
        zkVerifySession = (await import('zkverifyjs')).zkVerifySession;
      } catch (error: unknown) {
        throw new Error(
          `Failed to load zkVerifySession: ${(error as Error).message}`
        );
      }

      let session;
      try {
        session = await zkVerifySession.start().Volta().withWallet({
          source: selectedWalletSource!,
          accountAddress: selectedAccount!
        });
      } catch (error: unknown) {
        throw new Error(`Connection failed: ${(error as Error).message}`);
      }

      const { events, transactionResult } = await session
        .verify()
        .groth16(Library.snarkjs, CurveType.bn128)
        .execute({
          proofData: {
            proof: proofData,
            publicSignals: publicSignals,
            vk: vk
          },
          domainId: 0
        });
      
      events.on('ErrorEvent', (eventData) => {
        console.error(JSON.stringify(eventData));
      });

      let transactionInfo = null;
      try {
        transactionInfo = await transactionResult;
      } catch (error: unknown) {
        throw new Error(`Transaction failed: ${(error as Error).message}`);
      }

      if (transactionInfo && transactionInfo.statement && transactionInfo.aggregationId >= 0) {
        setVerified(true);
        return transactionInfo;
      } else {
        throw new Error("Your proof isn't correct.");
      }
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  return { verifying, verified, error, onVerifyProof };
}
