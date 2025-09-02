'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Check } from 'lucide-react';

export function WalletConnectionDialog() {
  const { walletConnection, connectWallet, disconnectWallet } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
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
          <Button 
            onClick={handleConnect} 
            className="w-full gap-2"
            size="lg"
          >
            <Wallet className="h-5 w-5" />
            Connect MetaMask
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By connecting your wallet, you agree to our terms of service.
            </p>
          </div>
        </div>
        
        <div id="dialog-description" className="sr-only">
          Dialog for connecting crypto wallet to unlock premium features
        </div>
      </DialogContent>
    </Dialog>
  );
}
