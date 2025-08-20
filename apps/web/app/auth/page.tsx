'use client';

import { ArrowLeft, Mail, ShieldCheck, Wallet } from 'lucide-react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

export default function AuthPage() {
  const { handleConnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'ready'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

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

  const requestOtp = async () => {
    if (!email) {
      toast.error('Enter your email to request a code');
      return;
    }
    try {
      const res = await fetch('/api/waitlist/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Email not found in waitlist', { description: 'Join the waitlist to get beta access.' });
        } else {
          toast.error('Failed to send code', { description: data?.error || 'Unknown error' });
        }
        return;
      }
      toast.success('Verification code sent');
      setStep('otp');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Unexpected error', { description: message });
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;
    try {
      const res = await fetch('/api/waitlist/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Invalid or expired code', { description: data?.error || 'Try again.' });
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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-emerald-100/30 dark:from-emerald-950/50 dark:via-transparent dark:to-emerald-900/30"></div>

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
          <Card className="glass-card animate-fade-in">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-emerald-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
                {step === 'email' ? <Mail className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                {step === 'email' ? 'Beta Access' : 'Enter Verification Code'}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                {step === 'email'
                  ? 'Enter your waitlist email to get an access code.'
                  : `We sent a 6-digit code to ${email}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 space-y-4">
              {step === 'email' ? (
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex gap-3 items-stretch">
                    <Button className="btn-emerald flex-1 !h-12" onClick={requestOtp}>
                      Request Code
                    </Button>
                    <WaitlistDialog triggerText="Join waitlist" triggerClassName="flex-1 !h-11" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex gap-3 items-stretch">
                    <Button variant="outline" className="flex-1 !h-11" onClick={() => setStep('email')}>
                      Back
                    </Button>
                    <Button className="btn-emerald flex-1 !h-11" disabled={otp.length !== 6} onClick={verifyOtp}>
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card animate-fade-in">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-emerald-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Connect your Stellar wallet to start trading stablecoins securely
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
