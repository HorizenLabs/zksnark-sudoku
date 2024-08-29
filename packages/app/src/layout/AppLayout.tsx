import React, { useState } from 'react';
import { purple } from '@ant-design/colors';
import { GithubOutlined } from '@ant-design/icons';
import { Col, Layout, Row } from 'antd';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import Image from 'next/image';
import { ReactNode } from 'react';
import {
    GITHUB_PROJECT,
    ORIGINAL_APP,
} from '../Constants';
import logo from '../images/sudoku.png';
import ConnectWalletButton from '../components/ConnectWalletButton';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    position: 'fixed',
                    zIndex: 1,
                    width: '100%',
                    background: purple.primary,
                }}
            >
                <Row align="middle" justify="space-between" style={{ height: '100%' }}>
                    <Col flex="1" />
                    <Col flex="none">
                        <Row align="middle" justify="center">
                            <Image src={logo.src} width={40} height={40} alt="logo" />
                            <h1
                                style={{
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    margin: 0,
                                    marginLeft: 10,
                                }}
                            >
                                <span style={{ marginRight: '10px' }}>{ORIGINAL_APP}</span>
                                <span
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        marginRight: '10px',
                                    }}
                                >
                  X
                </span>
                                <a
                                    href="https://zkverify.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="/zk_Verify_logo_full_white.png"
                                        alt="Logo"
                                        style={{ height: '50px', verticalAlign: 'middle' }}
                                    />
                                </a>
                            </h1>
                        </Row>
                    </Col>
                    <Col flex="1">
                        <Row align="middle" justify="end" gutter={20}>
                            <Col>
                                <a
                                    href={GITHUB_PROJECT}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GithubOutlined style={{ fontSize: 20, color: 'white' }} />
                                </a>
                            </Col>
                            <Col>
                                <ConnectWalletButton
                                    selectedAccount={selectedAccount}
                                    setSelectedAccount={setSelectedAccount}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Header>
            <Content style={{ marginTop: 60 }}>
                {React.cloneElement(children, { selectedAccount })}
            </Content>
            <Footer
                style={{
                    position: 'sticky',
                    bottom: 0,
                    textAlign: 'center',
                }}
            >
                © 2022 All rights reserved by Web3-Master.
            </Footer>
        </Layout>
    );
}
