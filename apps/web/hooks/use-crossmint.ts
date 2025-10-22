'use client';

import { useAuth, useWallet } from '@crossmint/client-sdk-react-ui';
import { useMemo, useEffect } from 'react';

export function useCrossmint() {
  const { login: crossmintLogin, logout: crossmintLogout, jwt } = useAuth();
  const { wallet, status: walletStatus } = useWallet();

  const login = async () => {
    try {
      await crossmintLogin();
    } catch (error) {
      console.error('Crossmint login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await crossmintLogout();
    } catch (error) {
      console.error('Crossmint logout error:', error);
      throw error;
    }
  };

  // Memoize computed values to prevent unnecessary re-renders
  const walletAddress = useMemo(() => {
    return wallet?.address || null;
  }, [wallet?.address]);

  const isWalletConnected = useMemo(() => {
    return walletStatus === 'loaded' && !!wallet;
  }, [walletStatus, wallet]);

  const isWalletLoading = useMemo(() => {
    return walletStatus === 'in-progress';
  }, [walletStatus]);

  const isAuthenticated = useMemo(() => {
    return !!jwt;
  }, [jwt]);

  // Handle persistence
  useEffect(() => {
    // Save authentication state to localStorage
    if (isAuthenticated && isWalletConnected && walletAddress) {
      localStorage.setItem('crossmint_authenticated', 'true');
      localStorage.setItem('crossmint_wallet_address', walletAddress);
    } else if (!isAuthenticated || !isWalletConnected) {
      localStorage.removeItem('crossmint_authenticated');
      localStorage.removeItem('crossmint_wallet_address');
    }
  }, [isAuthenticated, isWalletConnected, walletAddress]);

  return {
    // Crossmint auth state
    jwt,
    isAuthenticated,
    
    // Wallet state
    wallet,
    walletAddress,
    isWalletConnected,
    isWalletLoading,
    walletStatus,
    
    // Actions
    login,
    logout,
  };
}
