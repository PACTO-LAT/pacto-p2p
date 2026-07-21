'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthService } from '@/lib/services/auth';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailConfirmationMessage, setShowEmailConfirmationMessage] =
    useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await AuthService.signInWithProvider('google');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed';
      sileo.error({ title: message });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      sileo.error({ title: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const result = await AuthService.signUp(email, password);
        if (result.user) {
          // Check if email confirmation is needed
          if (!result.session) {
            // Email confirmation required - show message
            setShowEmailConfirmationMessage(true);
            sileo.success({
              title:
                'Account created! Please check your email to confirm your account.',
              duration: 8000,
            });
            // Switch to login mode so they can sign in after confirming
            setTimeout(() => {
              setMode('login');
              setShowEmailConfirmationMessage(false);
            }, 3000);
            return;
          }

          // Session exists - user is authenticated
          sileo.success({ title: 'Account created successfully!' });

          // Small delay to ensure session is fully established
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Refresh the page to ensure AuthGuard picks up the new session
          window.location.href = '/dashboard';
        } else {
          sileo.error({ title: 'Failed to create account. Please try again.' });
        }
      } else {
        await AuthService.signIn(email, password);
        sileo.success({ title: 'Logged in successfully!' });
        router.push('/dashboard');
      }
    } catch (error) {
      let message = 'Authentication failed';
      const err = error as { message?: string; code?: string } | undefined;

      // Check Supabase error code first (AuthApiError)
      if (err?.code === 'email_not_confirmed') {
        message =
          'Please check your email and confirm your account before signing in.';
      } else if (err?.code === 'invalid_credentials') {
        message =
          'Invalid email or password. If you just signed up, please check your email to confirm your account first.';
      } else if (err?.message) {
        message = err.message;
        if (
          message.includes('User already registered') ||
          message.includes('already registered')
        ) {
          message = 'This email is already registered. Please sign in instead.';
        } else if (
          message.includes('Email not confirmed') ||
          message.includes('email_not_confirmed')
        ) {
          message =
            'Please check your email and confirm your account before signing in.';
        } else if (
          message.includes('Invalid login credentials') ||
          message.includes('Invalid')
        ) {
          message =
            'Invalid email or password. If you just signed up, please check your email to confirm your account first.';
        } else if (
          message.includes('Email rate limit') ||
          message.includes('rate limit')
        ) {
          message = 'Too many requests. Please wait a moment and try again.';
        }
      }

      sileo.error({ title: message });
    } finally {
      setIsLoading(false);
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
        </div>

        <Card className="glass-card animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-emerald-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {mode === 'login'
                ? 'Sign in to your account'
                : 'Create an account to start trading stablecoins'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 space-y-6">
            {showEmailConfirmationMessage && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-400">
                  <strong>Check your email!</strong> We've sent a confirmation
                  link to <strong>{email}</strong>. Click the link in the email
                  to activate your account.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Don't see it? Check your spam folder.
                </p>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-emerald"
                disabled={isLoading || !email || !password}
              >
                {isLoading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </Button>
            </form>

            {/* Toggle between login/signup */}
            <div className="text-center text-sm">
              {mode === 'login' ? (
                <span className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
