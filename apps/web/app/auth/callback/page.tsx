'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * Handles the redirect from Supabase email confirmation.
 * When user clicks the link in the verification email, they land here.
 * The Supabase client exchanges the URL hash for a session, then we redirect to dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError('Failed to verify your email. Please try again.');
          return;
        }

        if (session) {
          router.replace('/dashboard');
          return;
        }

        // No session yet - hash might not be processed. Supabase exchanges hash on getSession.
        // If we have hash params, wait a moment for client to process
        if (typeof window !== 'undefined' && window.location.hash) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          if (retrySession) {
            router.replace('/dashboard');
            return;
          }
        }

        setError(
          'Verification link may have expired. Please request a new one.'
        );
      } catch {
        setError('Something went wrong. Please try again.');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-destructive mb-4">{error}</p>
        <a
          href="/auth"
          className="text-emerald-500 hover:text-emerald-400 font-medium"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
      <p className="text-muted-foreground">Verifying your email...</p>
    </div>
  );
}
