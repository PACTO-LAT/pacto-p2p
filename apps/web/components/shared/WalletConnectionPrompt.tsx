'use client';

import { Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { AuthService } from '@/lib/services/auth';
import { toast } from 'sonner';
import useGlobalAuthenticationStore from '@/store/wallet.store';

interface WalletConnectionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectionPrompt({
  open,
  onOpenChange,
}: WalletConnectionPromptProps) {
  const { user, updateProfile } = useAuth();
  const { handleConnect } = useWallet();
  const { address, isConnected } = useGlobalAuthenticationStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Close dialog if wallet is already connected and linked
  useEffect(() => {
    if (open && (isConnected && address) && user?.stellar_address === address) {
      onOpenChange(false);
    }
  }, [open, isConnected, address, user?.stellar_address, onOpenChange]);

  const handleConnectAndLink = async () => {
    if (!user) {
      toast.error('Please sign in to link your wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Connect wallet
      await handleConnect();
      
      // Wait a bit for wallet state to update
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Get the connected address
      const connectedAddress = useGlobalAuthenticationStore.getState().address;
      
      if (!connectedAddress) {
        throw new Error('Failed to get wallet address. Please try connecting again.');
      }

      // Link wallet to user profile
      setIsLinking(true);
      await AuthService.linkWalletToUser(user.id, connectedAddress);
      
      // Update local profile state
      await updateProfile({ stellar_address: connectedAddress });
      
      toast.success('Wallet linked successfully!');
      onOpenChange(false);
    } catch (error) {
      // Extract error message with better error handling
      let message = 'Failed to connect wallet';
      if (error instanceof Error) {
        message = error.message || message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        message = String(error.message);
      }
      
      console.error('Wallet connection error:', {
        error,
        message,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      
      toast.error(message);
    } finally {
      setIsConnecting(false);
      setIsLinking(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-emerald-gradient rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            Connect Your Stellar Wallet
          </DialogTitle>
          <DialogDescription className="text-center">
            Link your Stellar wallet to your account to start trading stablecoins.
            You can connect or change your wallet anytime in your profile settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            className="w-full btn-emerald"
            onClick={handleConnectAndLink}
            disabled={isConnecting || isLinking}
          >
            {isConnecting
              ? 'Connecting...'
              : isLinking
                ? 'Linking Wallet...'
                : 'Connect Wallet'}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
            disabled={isConnecting || isLinking}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
