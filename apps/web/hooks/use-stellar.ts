'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { StellarService } from '@/lib/services/stellar';
import { useAuth } from './use-auth';

export function useStellar() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user, updateProfile } = useAuth();

  const connectWallet = useCallback(async () => {
    try {
      const address = await StellarService.connectWallet();
      setWalletAddress(address);

      // Update user profile with wallet address
      if (user) {
        await updateProfile({ stellar_address: address });
      }

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [user, updateProfile]);

  return {
    walletAddress: walletAddress || user?.stellar_address,
    connectWallet,
  };
}

export function useTokenBalance(address?: string, token?: string) {
  return useQuery({
    queryKey: ['token-balance', address, token],
    queryFn: () =>
      address && token
        ? StellarService.getBalance(address, token)
        : Promise.resolve(0),
    enabled: !!address && !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSendPayment() {
  return useMutation({
    mutationFn: ({
      from,
      to,
      amount,
      token,
    }: {
      from: string;
      to: string;
      amount: number;
      token: string;
    }) => StellarService.sendPayment(from, to, amount, token),
  });
}
