'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCrossmint } from './use-crossmint';
import { CrossmintService, type CrossmintTransaction } from '@/lib/services/crossmint';
import { toast } from 'sonner';

export function useCrossmintWallet() {
  const { wallet, walletAddress, isWalletConnected } = useCrossmint();
  const [balance, setBalance] = useState<{ [token: string]: string }>({});
  const [transactions, setTransactions] = useState<CrossmintTransaction[]>([]);
  const [supportedTokens, setSupportedTokens] = useState<Array<{
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  }>>([]);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    owner: string;
    chain: string;
    memo?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = useCallback(async () => {
    if (!wallet || !isWalletConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Load balance
      const balanceData = await CrossmintService.getWalletBalance(wallet);
      
      // Set wallet info from wallet object directly
      const owner = wallet.owner || 'Unknown';
      const ownerEmail = owner.includes(':') ? owner.split(':')[1] : owner;
      setWalletInfo({
        address: wallet.address,
        owner: ownerEmail,
        chain: 'stellar',
        memo: undefined,
      });
      setBalance(balanceData);
      setTransactions([]);
      setSupportedTokens([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wallet data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallet, isWalletConnected]);

  // Load wallet data when wallet is connected
  useEffect(() => {
    if (isWalletConnected && wallet) {
      loadWalletData();
    } else {
      // Reset state when wallet is disconnected
      setBalance({});
      setTransactions([]);
      setWalletInfo(null);
      setError(null);
    }
  }, [isWalletConnected, wallet, loadWalletData]);

  const sendTokens = async (
    toAddress: string,
    amount: string,
    tokenSymbol: string
  ) => {
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    if (!CrossmintService.isValidStellarAddress(toAddress)) {
      throw new Error('Invalid Stellar address');
    }

    setLoading(true);
    setError(null);

    try {
      // Create proper token locator for Stellar
      let tokenLocator: string;
      if (tokenSymbol.toLowerCase() === 'xlm') {
        tokenLocator = 'XLM'; // Native XLM
      } else if (tokenSymbol.toLowerCase() === 'usdc') {
        tokenLocator = 'USDC'; // USDC symbol
      } else {
        tokenLocator = tokenSymbol.toUpperCase(); // Default format
      }
      
      const result = await CrossmintService.sendTokens(
        wallet,
        toAddress,
        tokenLocator,
        amount
      );

      toast.success(`Transaction sent! Hash: ${result.hash}`);
      
      // Reload wallet data to reflect the new transaction (with delay to allow blockchain confirmation)
      setTimeout(async () => {
        await loadWalletData();
      }, 2000);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send tokens';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    await loadWalletData();
  };

  const getTokenBalance = (token: string): string => {
    return balance[token] || '0';
  };

  const hasTokenBalance = (token: string): boolean => {
    const tokenBalance = getTokenBalance(token);
    return parseFloat(tokenBalance) > 0;
  };

  const sendStellarTransaction = async (
    contractId: string,
    method: string,
    args: Record<string, any>
  ) => {
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await CrossmintService.sendStellarTransaction(
        wallet,
        contractId,
        method,
        args
      );

      toast.success(`Transaction sent! Hash: ${result.hash}`);
      
      // Reload wallet data to reflect the new transaction (with delay to allow blockchain confirmation)
      setTimeout(async () => {
        await loadWalletData();
      }, 2000);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Wallet state
    walletAddress,
    isWalletConnected,
    balance,
    transactions,
    supportedTokens,
    walletInfo,
    loading,
    error,

    // Actions
    sendTokens,
    sendStellarTransaction,
    refreshWallet,
    getTokenBalance,
    hasTokenBalance,

    // Utilities
    formatAddress: CrossmintService.formatAddress,
    isValidAddress: CrossmintService.isValidStellarAddress,
  };
}
