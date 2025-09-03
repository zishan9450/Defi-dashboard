/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Check, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export function WalletConnectionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { walletConnection, isMetaMaskAvailable, metaMaskError, connectWallet, connectWalletConnect, disconnectWallet, refreshMetaMaskDetection } = useAuth();

  // Detect if user is on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  const handleRefreshMetaMask = async () => {
    setIsRefreshing(true);
    // Refresh MetaMask detection without page reload
    refreshMetaMaskDetection();
    toast.success('Checking for MetaMask...', {
      description: 'Please wait while we detect your wallet.',
      duration: 3000,
    });
    
    // Add a small delay to show the loading state
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const handleConnect = async () => {
    if (!isMetaMaskAvailable) {
      // Open MetaMask download page
      if (isMobile) {
        // For mobile, open the appropriate store
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        if (/android/i.test(userAgent.toLowerCase())) {
          window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
        } else if (/iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
          window.open('https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202', '_blank');
        } else {
          window.open('https://metamask.io/download/', '_blank');
        }
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
      return;
    }

    try {
      setIsConnecting(true);
      await connectWallet();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectWalletConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWalletConnect();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to connect WalletConnect:', error);
      // Error is already handled in AuthContext
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsOpen(false);
  };

  if (walletConnection.isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-600" />
          <span className="hidden sm:inline">Connected</span>
        </div>
        <Button variant="outline" onClick={handleDisconnect} size="sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription id="dialog-description">
            Connect your crypto wallet to unlock premium features and access Yield Aggregator pools.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* MetaMask not available */}
          {!isMetaMaskAvailable && (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {isMobile ? 'MetaMask Mobile App Required' : 'MetaMask not detected'}
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {isMobile 
                  ? 'Please install the MetaMask mobile app to connect your wallet.'
                  : 'Please install MetaMask extension to connect your wallet.'
                }
              </p>
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshMetaMask}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshing ? 'Checking...' : 'Refresh Detection'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (isMobile) {
                      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
                      if (/android/i.test(userAgent.toLowerCase())) {
                        window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
                      } else if (/iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
                        window.open('https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202', '_blank');
                      } else {
                        window.open('https://metamask.io/download/', '_blank');
                      }
                    } else {
                      window.open('https://metamask.io/download/', '_blank');
                    }
                  }}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  Download MetaMask
                </Button>
              </div>
            </div>
          )}

          {/* MetaMask available - show connect button */}
          {isMetaMaskAvailable && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="h-5 w-5" />
                <span className="font-medium">MetaMask Detected!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Great! MetaMask is now available. Click the button below to connect your wallet.
              </p>
            </div>
          )}

          {/* WalletConnect option - always available */}
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Wallet className="h-5 w-5" />
              <span className="font-medium">Mobile Wallet Connection</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Connect with your mobile wallet app. Works with MetaMask Mobile, Trust Wallet, and other mobile wallet apps.
            </p>
          </div>

          {/* Connection buttons */}
          <div className="space-y-3">
            {isMetaMaskAvailable && (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full gap-2"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
              </Button>
            )}
            
            <Button 
              onClick={handleConnectWalletConnect} 
              disabled={isConnecting}
              variant="outline"
              className="w-full gap-2"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect Mobile Wallet'}
            </Button>
          </div>

          {/* Error message */}
          {metaMaskError && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {metaMaskError}
              </p>
              {isMobile && (
                <p className="text-xs text-red-600 mt-2">
                  💡 Tip: Make sure MetaMask mobile app is open and unlocked
                </p>
              )}
            </div>
          )}

          {/* Help text */}
          <div className="text-center space-y-2">
            {!isMetaMaskAvailable ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isMobile 
                    ? 'MetaMask mobile app provides secure access to DeFi protocols.'
                    : 'MetaMask is a secure wallet for Ethereum and other blockchains.'
                  }
                </p>
                
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    if (isMobile) {
                      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
                      if (/android/i.test(userAgent.toLowerCase())) {
                        window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
                      } else if (/iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
                        window.open('https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202', '_blank');
                      } else {
                        window.open('https://metamask.io/download/', '_blank');
                      }
                    } else {
                      window.open('https://metamask.io/download/', '_blank');
                    }
                  }}
                  className="text-primary p-0 h-auto"
                >
                  {isMobile ? 'Download MetaMask App' : 'Learn more about MetaMask'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                By connecting your wallet, you agree to our terms of service.
              </p>
            )}
          </div>
        </div>
        
        <div id="dialog-description" className="sr-only">
          Dialog for connecting crypto wallet to unlock premium features
        </div>
      </DialogContent>
    </Dialog>
  );
}
