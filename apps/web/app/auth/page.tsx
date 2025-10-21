'use client';

import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { WaitlistDialog } from '@/components/marketing/WaitlistDialog';

export default function AuthPage() {
  const { handleConnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState<'code' | 'ready'>('code');
  const [code, setCode] = useState('');

  const handleWalletConnect = async () => {
    if (isConnecting) return; // Prevent multiple clicks

    setIsConnecting(true);
    try {
      await handleConnect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const verifyCode = async () => {
    if (!code) return;
    try {
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Invalid code', {
          description: data?.error || 'Try again.',
        });
        return;
      }
      toast.success('Access verified');
      setStep('ready');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Unexpected error', { description: message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 dark:from-black/30 dark:via-transparent dark:to-black/40"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          {/* <ThemeToggle /> */}
        </div>

        {step !== 'ready' ? (
          <Card className="glass-card-auth !important border-white animate-fade-in">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-emerald-700 rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Enter Access Code
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Enter the shared access code to continue to wallet connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 space-y-4">
              <div className="space-y-4">
                <Input className="glass-card-auth"
                  type="password"
                  placeholder="Enter access code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <div className="flex gap-3 items-stretch">
                  <Button
                    className="btn-emerald flex-1 !h-12"
                    onClick={verifyCode}
                    disabled={!code}
                  >
                    Verify Code
                  </Button>
                  <WaitlistDialog
                    triggerText="Join waitlist"
                    triggerClassName="flex-1 !h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card-auth animate-fade-in">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-emerald-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Connect your Stellar wallet to start trading stablecoins
                securely
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                className="w-full btn-emerald"
                onClick={handleWalletConnect}
                disabled={isConnecting}
              >
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 mr-3" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
