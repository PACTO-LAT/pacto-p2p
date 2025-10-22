'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useCrossmint } from '@/hooks/use-crossmint';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/auth'];

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isWalletConnected, walletAddress, walletStatus } = useCrossmint();
  const pathname = usePathname();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRedirectRef = useRef<string>('');
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Reset redirect flag when pathname changes
    if (lastRedirectRef.current !== pathname) {
      hasRedirectedRef.current = false;
    }

    // Don't redirect if wallet is still loading
    if (walletStatus === 'in-progress') {
      return;
    }

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

      const redirectKey = `${pathname}-${walletAddress || 'no-address'}-${isAuthenticated}-${isWalletConnected}`;

      // Only redirect if we haven't already redirected for this exact state
      if (
        isProtectedRoute &&
        (!isAuthenticated || !isWalletConnected) &&
        !hasRedirectedRef.current
      ) {
        hasRedirectedRef.current = true;
        lastRedirectRef.current = redirectKey;
        console.log('AuthGuard: Redirecting to /auth - not authenticated');
        window.location.href = '/auth';
      } else if (
        isAuthRoute &&
        isAuthenticated &&
        isWalletConnected &&
        !hasRedirectedRef.current
      ) {
        hasRedirectedRef.current = true;
        lastRedirectRef.current = redirectKey;
        console.log('AuthGuard: Redirecting to /dashboard - authenticated');
        window.location.href = '/dashboard';
      }
    }, 1000); // Increased debounce time to 1 second

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, isWalletConnected, walletAddress, pathname, walletStatus]);

  return <>{children}</>;
}
