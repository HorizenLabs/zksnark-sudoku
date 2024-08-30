import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Col, message, Row, Spin } from 'antd';
import ProofView from './ProofView';
import PuzzleView from './PuzzleView';
import { useZkVerify } from '../hooks/useZkVerify';
import { useAccount } from "../../context/AccountContext";

export default function VerifyPannel() {
  const { selectedAccount } = useAccount();
  const [puzzle, setPuzzle] = useState<number[]>(Array(81).fill(0));
  const [proof, setProof] = useState<string>('');
  const puzzleFile = useRef(null);
  const proofFile = useRef(null);
  const { verifying, verified, error, onVerifyProof } = useZkVerify(selectedAccount);

  const useSindriFlag = process.env.NEXT_PUBLIC_USE_SINDRI === 'true';

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (verified) {
      message.success('Proof verified successfully!');
    }
  }, [verified]);

  const onLoadPuzzle = () => {
    if (puzzleFile.current != null) puzzleFile.current.click();
  };

  const onLoadProof = () => {
    if (proofFile.current != null) proofFile.current.click();
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
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
              if (fileContent.length === 81) {
                setPuzzle(fileContent);
              } else {
                message.error('Selected file is not a valid puzzle file!');
              }
            } else if (event.target === proofFile.current) {
              setProof(JSON.stringify(fileContent));
            }
          } catch (error) {
            message.error('You selected the wrong file!');
          }
        }
      };
      fileReader.readAsText(file, 'UTF-8');
    }
  };

  const downloadTransactionInfo = (transactionInfo) => {
    const blob = new Blob([JSON.stringify(transactionInfo, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zkverify-${transactionInfo.attestationId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyClick = async () => {
    let vkey;
    let proofData = proof;

    if (useSindriFlag && proof) {
      const parsedProof = JSON.parse(proof);
      proofData = JSON.stringify(parsedProof.proof);
      vkey = parsedProof.verification_key;
    } else {
      vkey = await fetch('sudoku_verify_key.json').then(res => res.json());
    }

    const transactionInfo = await onVerifyProof(proofData, puzzle, vkey);
    if (transactionInfo) {
      message.success(`Verified Successfully on zkVerify - AttestationId: ${transactionInfo.attestationId}`);
      downloadTransactionInfo(transactionInfo);
    }
  };

  return (
      <>
        <input
            type="file"
            ref={puzzleFile}
            style={{ display: 'none' }}
            onChange={onFileSelected}
        />
        <input
            type="file"
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
                <Button type="primary" onClick={handleVerifyClick}>
                  Verify Proof
                </Button>
              </Col>
            </Row>
          </Card>
        </Spin>
      </>
  );
}
