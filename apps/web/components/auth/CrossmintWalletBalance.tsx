'use client';

import { useCrossmintWallet } from '@/hooks/use-crossmint-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wallet, Coins } from 'lucide-react';
import { CrossmintService } from '@/lib/services/crossmint';

export function CrossmintWalletBalance() {
  const {
    walletAddress,
    isWalletConnected,
    balance,
    supportedTokens,
    loading,
    error,
    refreshWallet,
  } = useCrossmintWallet();

  if (!isWalletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Connect your Crossmint wallet to view balances.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasBalances = Object.keys(balance).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshWallet}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground font-mono">
          {walletAddress ? CrossmintService.formatAddress(walletAddress) : 'No address'}
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading && !hasBalances ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading balances...</span>
          </div>
        ) : hasBalances ? (
          <div className="space-y-3">
            {Object.entries(balance).map(([token, amount]) => {
              const tokenInfo = supportedTokens.find(t => t.symbol === token);
              const displayAmount = parseFloat(amount).toFixed(6);
              
              return (
                <div
                  key={token}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {token.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{token}</p>
                      {tokenInfo && (
                        <p className="text-xs text-muted-foreground">
                          {tokenInfo.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">{displayAmount}</p>
                    {parseFloat(amount) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No token balances found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your wallet is connected but has no token balances
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
