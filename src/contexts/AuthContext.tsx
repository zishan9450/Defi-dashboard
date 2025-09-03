/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
}

interface AuthContextType {
  walletConnection: WalletConnection;
  isMetaMaskAvailable: boolean;
  metaMaskError: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isYieldAggregatorUnlocked: boolean;
  refreshMetaMaskDetection: () => void;
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
    isConnected: false
  });
  const [metaMaskError, setMetaMaskError] = useState<string | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Check if MetaMask is available
  const checkMetaMaskAvailability = () => {
    if (typeof window === 'undefined') return false;
    
    // Method 1: Check if ethereum object exists and has isMetaMask property
    if ((window as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask) {
      console.log('MetaMask detected via isMetaMask property');
      return true;
    }
    
    // Method 2: Check providers array (multiple wallet scenario)
    if ((window as { ethereum?: { providers?: unknown[] } }).ethereum?.providers) {
      const providers = (window as { ethereum?: { providers?: unknown[] } }).ethereum!.providers!;
      const hasMetaMask = providers.some((provider: unknown) => (provider as { isMetaMask?: boolean }).isMetaMask);
      if (hasMetaMask) {
        console.log('MetaMask detected via providers array');
        return true;
      }
    }
    
    // Method 3: Check if ethereum object exists (fallback)
    if ((window as { ethereum?: unknown }).ethereum) {
      console.log('Ethereum object detected, but MetaMask status unclear');
      return true;
    }
    
    // Method 4: Check for injected providers
    if ((window as { web3?: { currentProvider?: { isMetaMask?: boolean } } }).web3?.currentProvider?.isMetaMask) {
      console.log('MetaMask detected via web3.currentProvider');
      return true;
    }
    
    console.log('No MetaMask detected');
    return false;
  };

  // Update MetaMask availability state
  const updateMetaMaskAvailability = () => {
    const available = checkMetaMaskAvailability();
    const wasAvailable = isMetaMaskAvailable;
    
    if (available && !wasAvailable) {
      toast.success('MetaMask detected! You can now connect your wallet.', {
        description: 'The wallet connection is now available.',
        duration: 5000,
      });
    }
    
    setIsMetaMaskAvailable(available);
    return available;
  };

  // Check MetaMask availability on mount and when window gains focus
  useEffect(() => {
    updateMetaMaskAvailability();
    
    const handleFocus = () => {
      updateMetaMaskAvailability();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateMetaMaskAvailability();
      }
    };
    
    // Periodic check for MetaMask availability (every 3 seconds)
    const intervalId = setInterval(() => {
      updateMetaMaskAvailability();
    }, 3000);
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // Get the correct MetaMask provider
  const getMetaMaskProvider = (): { 
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  } | null => {
    if (typeof window === 'undefined') return null;
    
    // Check if ethereum is directly available
    if ((window as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask) {
      return (window as { ethereum?: { 
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        on: (event: string, callback: (...args: unknown[]) => void) => void;
        removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      } }).ethereum || null;
    }
    
    // Check if ethereum has providers array (multiple wallet scenario)
    if ((window as { ethereum?: { providers?: unknown[] } }).ethereum?.providers) {
      const providers = (window as { ethereum?: { providers?: unknown[] } }).ethereum!.providers!;
      const metaMaskProvider = providers.find((provider: unknown) => (provider as { isMetaMask?: boolean }).isMetaMask);
      if (metaMaskProvider) {
        return metaMaskProvider as { 
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
          on: (event: string, callback: (...args: unknown[]) => void) => void;
          removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
      }
    }
    
    // Fallback to window.ethereum
    return (window as { ethereum?: { 
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    } }).ethereum || null;
  };

  // Connect to MetaMask wallet with enhanced error handling
  const connectWallet = async () => {
    try {
      setMetaMaskError(null);
      
      const provider = getMetaMaskProvider();
      
      if (!provider) {
        const error = 'MetaMask is not installed. Please install MetaMask to continue.';
        setMetaMaskError(error);
        throw new Error(error);
      }

      // Check if already connected
      try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          // Already connected, just update state
          const account = accounts[0];
          const chainId = await provider.request({ method: 'eth_chainId' }) as string;
          setWalletConnection({
            isConnected: true,
            address: account,
            chainId: parseInt(chainId, 16)
          });
          return;
        }
      } catch {
        console.log('No existing connection, proceeding with new connection');
      }

      // Add a small delay to ensure MetaMask is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request new connection with retry logic
      let accounts: string[] = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Attempting to connect wallet (attempt ${retryCount + 1}/${maxRetries})`);
          accounts = await provider.request({
            method: 'eth_requestAccounts',
          }) as string[];
          break;
        } catch (error: any) {
          retryCount++;
          console.log(`Connection attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        const account = accounts[0];
        const chainId = await provider.request({ method: 'eth_chainId' }) as string;
        setWalletConnection({
          isConnected: true,
          address: account,
          chainId: parseInt(chainId, 16)
        });
        console.log('Wallet connected successfully:', account);
      } else {
        const error = 'No accounts found. Please unlock MetaMask and try again.';
        setMetaMaskError(error);
        throw new Error(error);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific MetaMask errors
      let errorMessage = 'Failed to connect wallet. Please try again.';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user. Please try again.';
      } else if (error.code === -32002) {
        errorMessage = 'MetaMask connection request already pending. Please check MetaMask.';
      } else if (error.code === -32003) {
        errorMessage = 'MetaMask is locked. Please unlock MetaMask and try again.';
      } else if (error.code === -32603) {
        errorMessage = 'MetaMask internal error. Please try refreshing the page.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMetaMaskError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnection({
      isConnected: false,
    });
    setMetaMaskError(null);
  };

  // Listen for wallet changes
  useEffect(() => {
    const provider = getMetaMaskProvider();
    
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletConnection(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed:', chainId);
        setWalletConnection(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16)
        }));
      };

      const handleConnect = (connectInfo: any) => {
        console.log('Wallet connected:', connectInfo);
      };

      const handleDisconnect = (error: any) => {
        console.log('Wallet disconnected:', error);
        disconnectWallet();
      };

      // Add event listeners
      provider.on('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
      provider.on('chainChanged', handleChainChanged as (...args: unknown[]) => void);
      provider.on('connect', handleConnect as (...args: unknown[]) => void);
      provider.on('disconnect', handleDisconnect as (...args: unknown[]) => void);

      // Cleanup
      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
        provider.removeListener('chainChanged', handleChainChanged as (...args: unknown[]) => void);
        provider.removeListener('connect', handleConnect as (...args: unknown[]) => void);
        provider.removeListener('disconnect', handleDisconnect as (...args: unknown[]) => void);
      };
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const provider = getMetaMaskProvider();
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
          if (accounts && accounts.length > 0) {
            const account = accounts[0];
            const chainId = await provider.request({ method: 'eth_chainId' }) as string;
            setWalletConnection({
              isConnected: true,
              address: account,
              chainId: parseInt(chainId, 16)
            });
          }
        }
      } catch {
        // Ignore errors when checking existing connection
      }
    };

    checkExistingConnection();
  }, []);

  // Check if Yield Aggregator should be unlocked
  const isYieldAggregatorUnlocked = walletConnection.isConnected;

  // Manual refresh function for MetaMask detection
  const refreshMetaMaskDetection = () => {
    updateMetaMaskAvailability();
  };

  const value: AuthContextType = {
    walletConnection,
    isMetaMaskAvailable,
    metaMaskError,
    connectWallet,
    disconnectWallet,
    isYieldAggregatorUnlocked,
    refreshMetaMaskDetection,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
