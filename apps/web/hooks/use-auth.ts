'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    const bootstrap = async () => {
      try {
        // Use getSession() for initial load - reads from storage immediately (no network delay).
        // Avoids "logged out" flash on page reload that getCurrentUser() can cause.
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id);
          if (profile) setUser(profile);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      unsub = { unsubscribe: () => subscription.unsubscribe() };
    };

    bootstrap();

    return () => {
      if (unsub) unsub.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await AuthService.signIn(email, password);
    router.push('/dashboard');
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const data = await AuthService.signUp(email, password);
    router.push('/dashboard');
    return data;
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    return AuthService.signInWithProvider(provider);
  };

  const signOut = async () => {
    await AuthService.signOut();
    router.push('/');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    const updatedUser = await AuthService.updateUserProfile(user.id, updates);
    setUser(updatedUser);
    return updatedUser;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateProfile,
  };
}
