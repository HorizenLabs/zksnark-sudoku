import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Button, message } from 'antd';

const WalletSelect = dynamic(() => import('@talismn/connect-components').then((mod) => mod.WalletSelect), {
    ssr: false, // This ensures the component is only loaded on the client side
});

const ConnectWalletButton: React.FC<{ setSelectedAccount: (account: string | null) => void, selectedAccount: string | null }> = ({ setSelectedAccount, selectedAccount }) => {
    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState<boolean>(false);

    const handleWalletConnectOpen = () => {
        setIsWalletSelectOpen(true);
    };

    const handleWalletConnectClose = () => {
        setIsWalletSelectOpen(false);
    };

    const handleWalletSelected = (wallet: any) => {
        console.log('Wallet selected:', wallet);
    };

    const handleUpdatedAccounts = (accounts: any[] | undefined) => {
        console.log('Updated accounts:', accounts);
        if (accounts && accounts.length > 0) {
            setSelectedAccount(accounts[0].address);
        } else {
            setSelectedAccount(null);
            message.error('No accounts available.');
        }
    };

    const handleAccountSelected = (account: any) => {
        console.log('Account selected:', account);
        setSelectedAccount(account.address);
        message.success(`Connected account: ${account.address}`);
    };

    const handleError = (error: any) => {
        console.error('Error during wallet interaction:', error);

        const errorMessage = error && typeof error === 'object' && 'message' in error
            ? error.message
            : 'Unknown error occurred during wallet interaction';

        if (errorMessage && isCriticalError(errorMessage)) {
            message.error(`An error occurred: ${errorMessage}`);
        }
    };

    const isCriticalError = (errorMessage: string) => {
        return errorMessage !== 'Unknown error occurred during wallet interaction';
    };

    return (
        <>
            <Button
                className={selectedAccount ? 'connectedButton' : 'connectButton'}
                onClick={handleWalletConnectOpen}
            >
                {selectedAccount ? `Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Connect Wallet'}
            </Button>

            {isWalletSelectOpen && (
                <WalletSelect
                    dappName="zkVerify"
                    open={isWalletSelectOpen}
                    onWalletConnectOpen={handleWalletConnectOpen}
                    onWalletConnectClose={handleWalletConnectClose}
                    onWalletSelected={handleWalletSelected}
                    onUpdatedAccounts={handleUpdatedAccounts}
                    onAccountSelected={handleAccountSelected}
                    onError={handleError}
                    showAccountsList={true}
                />
            )}
        </>
    );
};

export default ConnectWalletButton;
