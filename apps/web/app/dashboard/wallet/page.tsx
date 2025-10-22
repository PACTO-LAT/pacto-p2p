'use client';

import { CrossmintAuthButton, CrossmintWalletInfo, CrossmintWalletBalance, CrossmintSendTokens } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wallet, Shield, Zap } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="space-y-8">

      {/* Wallet Connection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <CrossmintAuthButton />
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-white/20" />

      {/* Wallet Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrossmintWalletInfo />
        <CrossmintWalletBalance />
      </div>

      <Separator className="bg-white/20" />

      {/* Send Tokens */}
      <CrossmintSendTokens />
    </div>
  );
}
