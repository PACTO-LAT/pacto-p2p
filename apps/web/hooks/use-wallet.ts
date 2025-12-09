import { useEffect } from 'react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { KitEventType } from '@creit-tech/stellar-wallets-kit/types';
import { initializeWalletKit } from '@/lib/wallet';
import useGlobalAuthenticationStore from '@/store/wallet.store';

export const useWallet = () => {
  const { connectWalletStore, disconnectWalletStore, updateConnectionStatus } =
    useGlobalAuthenticationStore();

  // Initialize kit and set up event listeners on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Initialize the kit
    initializeWalletKit();

    // Listen to state updates
    const unsubscribeState = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        const { address, networkPassphrase } = event.payload;
        
        if (address) {
          const network = networkPassphrase.includes('TESTNET') ? 'testnet' : 'mainnet';
          // Try to get wallet info, but if not available, use defaults
          const walletType = 'Connected Wallet'; // Default, can be improved later
          const publicKey = address;

          connectWalletStore(address, network, walletType, publicKey);
          updateConnectionStatus(true);
        } else {
          disconnectWalletStore();
          updateConnectionStatus(false);
        }
      }
    );

    // Listen to disconnect events
    const unsubscribeDisconnect = StellarWalletsKit.on(
      KitEventType.DISCONNECT,
      () => {
        disconnectWalletStore();
        updateConnectionStatus(false);
      }
    );

    // Try to get current address if already connected
    const checkExistingConnection = async () => {
      try {
        const { address } = await StellarWalletsKit.getAddress();
        if (address) {
          const network = 'testnet'; // Default to testnet for now
          const walletType = 'Connected Wallet';
          const publicKey = address;
          connectWalletStore(address, network, walletType, publicKey);
          updateConnectionStatus(true);
        }
      } catch {
        // No active connection, that's fine
      }
    };

    checkExistingConnection();

    return () => {
      unsubscribeState();
      unsubscribeDisconnect();
    };
  }, [connectWalletStore, disconnectWalletStore, updateConnectionStatus]);

  const connectWallet = async () => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('Wallet connection can only be used on the client side');
    }

    try {
      // Initialize if not already done
      initializeWalletKit();

      // Open auth modal - this will trigger STATE_UPDATED event when wallet is connected
      await StellarWalletsKit.authModal();
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      updateConnectionStatus(false);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await StellarWalletsKit.disconnect();
      // The DISCONNECT event will handle updating the store
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // You might want to show a toast notification here
    }
  };

  return {
    handleConnect,
    handleDisconnect,
  };
};
