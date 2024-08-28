import 'dotenv/config';
import { Button, Card, Col, message, Row, Spin, Typography } from 'antd';
import { ChangeEvent, useRef, useState } from 'react';
import ProofView from './ProofView';
import PuzzleView from './PuzzleView';
import { zkVerifySession, VerifyTransactionInfo, ZkVerifyEvents } from 'zkverifyjs';
import { packDigits } from '../utils/GameUtils';

export default function VerifyPannel({ selectedAccount }) {
  const [puzzle, setPuzzle] = useState<number[]>(Array(81).fill(0));
  const [proof, setProof] = useState<string>('');
  const [verified, setVerified] = useState<boolean>(false);

  const puzzleFile = useRef(null);
  const proofFile = useRef(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage();

  const isValidPuzzleData = (puzzleData: number[]): boolean => {
    return puzzleData.length === 81;
  };

  const isValidProofData = (proofData: {
    pi_a: [];
    pi_b: [];
    pi_c: [];
    protocol: string;
    curve: string;
  }): boolean => {
    return proofData.protocol === 'groth16' && proofData.curve === 'bn128';
  };

  const onLoadPuzzle = () => {
    if (puzzleFile.current != null) puzzleFile.current.click();
    setVerified(false);
  };

  const onLoadProof = () => {
    setVerified(false);
    if (proofFile.current != null) proofFile.current.click();
  };

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.files != null && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target != null) {
          try {
            const fileContent = JSON.parse(e.target.result as string);
            if (event.target === puzzleFile.current) {
              if (isValidPuzzleData(fileContent)) {
                setPuzzle(fileContent);
              } else {
                messageApi.error('Selected file is not a valid puzzle file!');
              }
            } else if (event.target === proofFile.current) {
              if (isValidProofData(fileContent)) {
                setProof(JSON.stringify(fileContent));
              } else {
                messageApi.error('Selected file is not a valid proof file!');
              }
            }
          } catch (error) {
            messageApi.error('You selected the wrong file!');
          }
        }
      };
      fileReader.readAsText(file, 'UTF-8');
    }
  };

  const onSaveTransactionInfo = (transactionInfo) => {
    const jsonString = JSON.stringify(transactionInfo, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'zkverify.json';
    link.href = url;
    link.click();
  };

  const onVerifyProof = async () => {
    if (proof === '') {
      messageApi.error('Please select your proof file!');
      return;
    }

    if (!selectedAccount) {
      messageApi.error('No account connected!');
      return;
    }

    const vkey = await fetch('sudoku_verify_key.json').then((res) => res.json());

    setVerifying(true);

    const packedPuzzle = packDigits(puzzle);
    const publicSignals = ['1', ...packedPuzzle.map(p => p.toString())];

    const proofData = JSON.parse(proof);

    const session = await zkVerifySession.start().Testnet().withAccount(process.env.NEXT_PUBLIC_SEED_PHRASE!);

    // TODO: Replace with a wallet connection.  Needs an update to zkverifyjs.
    // let session;
    // try {
    //   session = await zkVerifySession.start().Testnet().withWallet();
    // } catch (error: unknown) {
    //   console.error("Connection didn't work");
    //
    //   const errorMessage = error instanceof Error ? error.message : String(error);
    //
    //   throw new Error(errorMessage);
    // }

    const { events, transactionResult } = await session.verify()
        .groth16()
        .execute(proofData, publicSignals, vkey);

    events.on(ZkVerifyEvents.ErrorEvent, (eventData) => {
      console.error(JSON.stringify(eventData));
    });

    let transactionInfo: VerifyTransactionInfo | null = null;
    try {
      transactionInfo = await transactionResult;
    } catch (error: unknown) {
      console.error(error);
    }

    setVerifying(false);

    if (transactionInfo && transactionInfo.attestationId) {
      messageApi.success(
          `Your proof has been verified on zkVerify!! You solved the puzzle, Attestation Id: ${transactionInfo.attestationId}`,
          5
      );
      onSaveTransactionInfo(transactionInfo);
      setVerified(true);
    } else {
      messageApi.error("Your proof isn't correct.", 5);
      setVerified(false);
    }
  };

  return (
      <>
        {contextHolder}
        <input
            type="file"
            id="puzzleFile"
            ref={puzzleFile}
            style={{ display: 'none' }}
            onChange={onFileSelected}
        />
        <input
            type="file"
            id="proofFile"
            ref={proofFile}
            style={{ display: 'none' }}
            onChange={onFileSelected}
        />
        <Row justify="center">
          <Col>
            <a href="https://zkverify.io" target="_blank" rel="noopener noreferrer">
              <img
                  src="/zk_Verify_logo_full_white.png"
                  alt="Logo"
                  style={{ height: '50px', verticalAlign: 'middle' }}
              />
            </a>
          </Col>
        </Row>
        <Spin
            spinning={verifying}
            tip={
              <img
                  src="/zk_Verify_logo_full_white.png"
                  alt="Verifying..."
                  style={{ height: '30px', verticalAlign: 'middle' }}
              />
            }
            size="large"
        >
          <Card title="Puzzle">
            <PuzzleView puzzle={puzzle} />
            <Row gutter={20} justify="center" style={{ marginTop: 10 }}>
              <Col>
                <Button type="primary" onClick={onLoadPuzzle}>
                  Load Puzzle
                </Button>
              </Col>
            </Row>
          </Card>
          <Card
              title={verified ? 'Proof - YOU SOLVED THE PUZZLE!' : 'Proof'}
              style={{ marginTop: 10 }}
          >
            <ProofView proof={proof} disabled={true} />
            <Row gutter={20} justify="center" style={{ marginTop: 10 }}>
              <Col>
                <Button type="primary" onClick={onLoadProof}>
                  Load Proof
                </Button>
              </Col>
              <Col>
                <Button type="primary" onClick={onVerifyProof}>
                  Verify Proof
                </Button>
              </Col>
            </Row>
          </Card>
        </Spin>
      </>
  );
}
