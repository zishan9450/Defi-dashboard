'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletConnection, UserAuth } from '@/types';

interface AuthContextType {
  walletConnection: WalletConnection;
  userAuth: UserAuth;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isYieldAggregatorUnlocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({
    isConnected: false,
  });
  
  const [userAuth, setUserAuth] = useState<UserAuth>({
    isLoggedIn: false,
  });

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!isMetaMaskAvailable) {
      alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        setWalletConnection({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16),
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnection({
      isConnected: false,
    });
  };

  // Mock login function
  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation
    if (email && password) {
      setUserAuth({
        isLoggedIn: true,
        email,
      });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  // Logout function
  const logout = () => {
    setUserAuth({
      isLoggedIn: false,
    });
  };

  // Check if Yield Aggregator should be unlocked
  const isYieldAggregatorUnlocked = walletConnection.isConnected || userAuth.isLoggedIn;

  // Listen for wallet changes
  useEffect(() => {
    if (isMetaMaskAvailable) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletConnection(prev => ({
            ...prev,
            address: accounts[0],
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletConnection(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isMetaMaskAvailable]);

  const value: AuthContextType = {
    walletConnection,
    userAuth,
    connectWallet,
    disconnectWallet,
    login,
    logout,
    isYieldAggregatorUnlocked,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
