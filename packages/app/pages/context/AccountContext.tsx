import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

// Define the shape of your context's value
interface AccountContextType {
    selectedAccount: string | null;
    setSelectedAccount: React.Dispatch<React.SetStateAction<string | null>>;
}

// Provide a default value for the context (initially null or an object with placeholders)
export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    return (
        <AccountContext.Provider value={{ selectedAccount, setSelectedAccount }}>
    {children}
    </AccountContext.Provider>
);
};

// Custom hook for easy access to the context
export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};
