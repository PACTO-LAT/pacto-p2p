"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import useGlobalAuthenticationStore from "@/store/wallet.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/auth"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { address, isConnected } = useGlobalAuthenticationStore();
  const pathname = usePathname();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRedirectRef = useRef<string>("");

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Debounce redirects to prevent rapid successive redirects
    redirectTimeoutRef.current = setTimeout(() => {
      // Check if current route requires authentication
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname.startsWith(route)
      );
      
      // Check if current route is an auth route (login/signup)
      const isAuthRoute = AUTH_ROUTES.some(route => 
        pathname.startsWith(route)
      );

      const redirectKey = `${pathname}-${address || 'no-address'}-${isConnected}`;
      
      // Only redirect if we haven't already redirected for this exact state
      if (isProtectedRoute && (!address || !isConnected) && lastRedirectRef.current !== redirectKey) {
        lastRedirectRef.current = redirectKey;
        window.location.href = "/auth";
      } else if (isAuthRoute && address && isConnected && lastRedirectRef.current !== redirectKey) {
        lastRedirectRef.current = redirectKey;
        window.location.href = "/dashboard";
      }
    }, 300); // 300ms debounce

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [address, isConnected, pathname]);

  return <>{children}</>;
} 