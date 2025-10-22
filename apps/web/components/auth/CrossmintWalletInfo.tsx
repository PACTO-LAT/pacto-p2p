'use client';

import { useCrossmint } from '@/hooks/use-crossmint';
import { useCrossmintWallet } from '@/hooks/use-crossmint-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function CrossmintWalletInfo() {
  const { wallet, walletAddress, isWalletConnected, walletStatus } = useCrossmint();
  const { walletInfo } = useCrossmintWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success('Wallet address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy address');
      }
    }
  };

  if (!isWalletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Crossmint Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No wallet connected. Connect your Crossmint wallet to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Crossmint Wallet
          <Badge variant="secondary" className="ml-auto">
            {walletStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Wallet Address
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
              {walletAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {wallet && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Chain
            </p>
            <p className="text-sm mt-1">Stellar</p>
          </div>
        )}

        {walletInfo && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Owner Email
            </p>
            <p className="text-sm mt-1">{walletInfo.owner}</p>
          </div>
        )}

        {walletInfo?.memo && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Wallet Memo
            </p>
            <p className="text-sm mt-1 font-mono">{walletInfo.memo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
