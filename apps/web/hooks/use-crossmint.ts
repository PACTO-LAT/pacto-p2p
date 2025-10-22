'use client';

import { useAuth, useWallet } from '@crossmint/client-sdk-react-ui';
import { useAuth as useAppAuth } from './use-auth';
import { useEffect, useState } from 'react';

export function useCrossmint() {
  const { login: crossmintLogin, logout: crossmintLogout, jwt } = useAuth();
  const { wallet, status: walletStatus } = useWallet();
  const { user: appUser, updateProfile } = useAppAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  // Handle wallet creation and user profile updates
  useEffect(() => {
    const handleWalletCreation = async () => {
      if (wallet?.address && appUser && !appUser.stellar_address) {
        try {
          setIsInitializing(true);
          
          // Update user profile with the new wallet address
          await updateProfile({
            stellar_address: wallet.address,
          });
          
          console.log('User profile updated with Crossmint wallet address:', wallet.address);
        } catch (error) {
          console.error('Error updating user profile with wallet address:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    handleWalletCreation();
  }, [wallet, appUser, updateProfile]);

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

  const getWalletAddress = () => {
    return wallet?.address || null;
  };

  const isWalletConnected = () => {
    return walletStatus === 'loaded' && !!wallet;
  };

  const isWalletLoading = () => {
    return walletStatus === 'in-progress' || isInitializing;
  };

  return {
    // Crossmint auth state
    jwt,
    isAuthenticated: !!jwt,
    
    // Wallet state
    wallet,
    walletAddress: getWalletAddress(),
    isWalletConnected: isWalletConnected(),
    isWalletLoading: isWalletLoading(),
    walletStatus,
    
    // Actions
    login,
    logout,
    
    // App user integration
    appUser,
    isInitializing,
  };
}
