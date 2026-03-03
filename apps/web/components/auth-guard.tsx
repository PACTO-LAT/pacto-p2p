'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { supabase } from '@/lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/auth'];

export function AuthGuard({ children }: AuthGuardProps) {
  const { address, isConnected } = useGlobalAuthenticationStore();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRedirectRef = useRef<string>('');

  useEffect(() => {
    // Use getSession() for initial check - reads from storage immediately (no network delay).
    // getCurrentUser()/getUser() validates with server and can cause a flash of "logged out" on reload.
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Wait for auth check to complete
    if (isAuthenticated === null) return;

    // Debounce redirects to prevent rapid successive redirects
    redirectTimeoutRef.current = setTimeout(() => {
      // Check if current route requires authentication
      const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      // Check if current route is an auth route (login/signup)
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      // User is authenticated if they have Supabase session OR wallet connected
      const hasAuth = isAuthenticated || (address && isConnected);

      const redirectKey = `${pathname}-${hasAuth}`;

      // Only redirect if we haven't already redirected for this exact state
      if (
        isProtectedRoute &&
        !hasAuth &&
        lastRedirectRef.current !== redirectKey
      ) {
        lastRedirectRef.current = redirectKey;
        window.location.href = '/auth';
      } else if (
        isAuthRoute &&
        hasAuth &&
        lastRedirectRef.current !== redirectKey
      ) {
        lastRedirectRef.current = redirectKey;
        window.location.href = '/dashboard';
      }
    }, 300); // 300ms debounce

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [address, isConnected, pathname, isAuthenticated]);

  return <>{children}</>;
}
