"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import useGlobalAuthenticationStore from "@/store/wallet.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WalletInfoProps {
  showDetails?: boolean;
  className?: string;
}

export function WalletInfo({ showDetails = true, className = "" }: WalletInfoProps) {
  const { address, network, walletType, isConnected, publicKey } = useGlobalAuthenticationStore();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  const openExplorer = () => {
    if (address) {
      const explorerUrl = network === "testnet" 
        ? `https://laboratory.stellar.org/#explorer?resource=account&values=${address}`
        : `https://stellar.expert/explorer/public/account/${address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!address || !isConnected) {
    return (
      <Card className={cn("feature-card", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Wallet Status
          </CardTitle>
          <CardDescription>
            Connect your Stellar wallet to start trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Not Connected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("feature-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Wallet Information
        </CardTitle>
        <CardDescription>
          Your connected Stellar wallet details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Connection Status
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Connected</span>
          </div>
        </div>

        {/* Wallet Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Wallet Type
          </span>
          <Badge variant="secondary" className="glass-effect-light">{walletType}</Badge>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Network
          </span>
          <Badge variant={network === "testnet" ? "destructive" : "default"} className="glass-effect">
            {network.toUpperCase()}
          </Badge>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Public Address
          </span>
          <div className="flex items-center gap-2 p-3 glass-effect-light rounded-lg">
            <code className="flex-1 text-sm font-mono text-foreground">
              {address}
            </code>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0 hover:bg-glass-hover"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openExplorer}
                className="h-8 w-8 p-0 hover:bg-glass-hover"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Public Key (same as address in Stellar) */}
        {showDetails && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Public Key
            </span>
            <div className="p-3 glass-effect-light rounded-lg">
              <code className="text-sm font-mono text-foreground">
                {publicKey}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              In Stellar, the public key is the same as the account address
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 