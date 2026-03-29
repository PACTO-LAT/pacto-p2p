'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string) => Promise<unknown>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<unknown>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  updateAvatarUrl: (avatarUrl: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    // Track the last user id we loaded so we don't re-fetch on redundant events
    let loadedUserId: string | null = null;

    const loadProfile = async (userId: string) => {
      if (loadedUserId === userId) return; // already loaded for this user
      loadedUserId = userId;
      const profile = await AuthService.getUserProfile(userId);
      setUser(profile);
      setLoading(false);
    };

    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // These events don't require re-fetching the profile
        if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          loadedUserId = null;
          setUser(null);
          setLoading(false);
        }
      });

      unsub = { unsubscribe: () => subscription.unsubscribe() };
    };

    bootstrap();

    return () => {
      if (unsub) unsub.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await AuthService.signIn(email, password);
      router.push('/dashboard');
      return data;
    },
    [router]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const data = await AuthService.signUp(email, password);
      router.push('/dashboard');
      return data;
    },
    [router]
  );

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'github') => {
      return AuthService.signInWithProvider(provider);
    },
    []
  );

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) throw new Error('No user logged in');
      const updatedUser = await AuthService.updateUserProfile(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    },
    [user]
  );

  const updateAvatarUrl = useCallback(
    async (avatarUrl: string) => {
      if (!user) throw new Error('No user logged in');
      const updatedUser = await AuthService.updateAvatarUrl(user.id, avatarUrl);
      setUser(updatedUser);
      return updatedUser;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
        updateProfile,
        updateAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
