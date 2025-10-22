'use client';

import { useCrossmint } from '@/hooks/use-crossmint';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function CrossmintAuthButton() {
  const {
    isAuthenticated,
    isWalletConnected,
    isWalletLoading,
    walletAddress,
    login,
    logout,
  } = useCrossmint();

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Successfully connected to Crossmint');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to connect to Crossmint');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully disconnected from Crossmint');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to disconnect from Crossmint');
    }
  };

  if (isWalletLoading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isAuthenticated && isWalletConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-xs">
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleLogin}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Crossmint Wallet
    </Button>
  );
}
