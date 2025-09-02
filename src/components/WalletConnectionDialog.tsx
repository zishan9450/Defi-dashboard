'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

interface WalletConnectionDialogProps {
  children: React.ReactNode;
}

export function WalletConnectionDialog({ children }: WalletConnectionDialogProps) {
  const { walletConnection, connectWallet } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = walletConnection.isConnected;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Unlock Yield Aggregator
          </DialogTitle>
        </DialogHeader>
        <div id="dialog-description" className="sr-only">
          Connect your MetaMask wallet to unlock Yield Aggregator pools
        </div>
        
        {isConnected ? (
          <div className="text-center py-4">
            <div className="text-green-600 font-medium mb-2">
              ✅ Yield Aggregator Unlocked!
            </div>
            <p className="text-sm text-muted-foreground">
              You can now access Yield Aggregator pools.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Connect your MetaMask wallet to unlock Yield Aggregator pools.
              </p>
              <Button 
                onClick={handleWalletConnect} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
            </div>
            
            {/* error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            ) */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
