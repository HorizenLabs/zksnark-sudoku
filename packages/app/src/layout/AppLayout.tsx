import React, { useState } from 'react';
import { purple } from '@ant-design/colors';
import {
  GithubOutlined,
  GoogleOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Col, Layout, Row } from 'antd';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import Image from 'next/image';
import { ReactNode } from 'react';
import {
  APP_NAME,
  GITHUB,
  GITHUB_PROJECT,
  GMAIL,
  LINKEDIN,
  ORIGINAL_APP,
} from '../Constants';
import logo from '../images/sudoku.png';
import ConnectWalletButton from '../components/ConnectWalletButton';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  return (
      <Row>
        <Col span={24}>
          <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                  position: 'fixed',
                  zIndex: 1,
                  width: '100%',
                  background: purple.primary,
                }}
            >
              <Row align="center" gutter={20} justify="space-between">
                <Row align="center" gutter={20}>
                  <Col>
                    <Image src={logo.src} width={40} height={40} alt="logo" />
                  </Col>
                  <Col>
                    <h1 style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '10px' }}>{ORIGINAL_APP}</span>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', marginRight: '10px' }}>X</span>
                      <a href="https://zkverify.io" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/zk_Verify_logo_full_white.png"
                            alt="Logo"
                            style={{ height: '50px', verticalAlign: 'middle' }}
                        />
                      </a>
                    </h1>
                  </Col>
                </Row>
                <Row align="center" gutter={20}>
                  <Col>
                    <a
                        href={GITHUB_PROJECT}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      <GithubOutlined style={{ fontSize: 20 }} />
                    </a>
                  </Col>
                  <Col>
                    <ConnectWalletButton
                        selectedAccount={selectedAccount}
                        setSelectedAccount={setSelectedAccount}
                    />
                  </Col>
                </Row>
              </Row>
            </Header>
            <Content style={{ marginTop: 60 }}>{React.cloneElement(children, { selectedAccount })}</Content>
            <Footer
                style={{
                  position: 'sticky',
                  bottom: 0,
                  textAlign: 'center',
                }}
            >
              © 2022 All rights reserved by Web3-Master.
              <a href={GMAIL} rel="noopener noreferrer">
                <GoogleOutlined style={{ fontSize: 16, marginLeft: 20 }} />
              </a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                <LinkedinOutlined style={{ fontSize: 16, marginLeft: 10 }} />
              </a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                <GithubOutlined style={{ fontSize: 16, marginLeft: 10 }} />
              </a>
            </Footer>
          </Layout>
        </Col>
      </Row>
  );
}
