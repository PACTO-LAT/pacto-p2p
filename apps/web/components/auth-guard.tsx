'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { AuthService } from '@/lib/services/auth';
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
    // Check Supabase auth status
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    
    // Also listen to auth state changes
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
