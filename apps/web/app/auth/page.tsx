'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailConfirmationMessage, setShowEmailConfirmationMessage] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
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
            toast.success(
              'Account created! Please check your email to confirm your account.',
              { duration: 8000 }
            );
            // Switch to login mode so they can sign in after confirming
            setTimeout(() => {
              setMode('login');
              setShowEmailConfirmationMessage(false);
            }, 3000);
            return;
          }
          
          // Session exists - user is authenticated
          toast.success('Account created successfully!');
          
          // Small delay to ensure session is fully established
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          // Refresh the page to ensure AuthGuard picks up the new session
          window.location.href = '/dashboard';
        } else {
          toast.error('Failed to create account. Please try again.');
        }
      } else {
        await AuthService.signIn(email, password);
        toast.success('Logged in successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      let message = 'Authentication failed';
      
      if (error instanceof Error) {
        message = error.message;
        // Provide user-friendly error messages
        if (message.includes('User already registered') || message.includes('already registered')) {
          message = 'This email is already registered. Please sign in instead.';
        } else if (message.includes('Password') || message.includes('password')) {
          message = 'Password must be at least 6 characters';
        } else if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
          message = 'Please check your email and confirm your account before signing in.';
        } else if (message.includes('Invalid login credentials') || message.includes('Invalid')) {
          message = 'Invalid email or password';
        } else if (message.includes('Email rate limit') || message.includes('rate limit')) {
          message = 'Too many requests. Please wait a moment and try again.';
        } else if (message.includes('email')) {
          message = 'Please enter a valid email address';
        }
      } else if (error && typeof error === 'object') {
        // Handle Supabase error objects
        const supabaseError = error as { message?: string; code?: string };
        if (supabaseError.message) {
          message = supabaseError.message;
        } else if (supabaseError.code) {
          message = `Error ${supabaseError.code}. Please try again.`;
        }
      }
      
      toast.error(message);
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
                  <strong>Check your email!</strong> We've sent a confirmation link to{' '}
                  <strong>{email}</strong>. Click the link in the email to activate your account.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Don't see it? Check your spam folder.
                </p>
              </div>
            )}
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
