import { useEffect } from 'react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { KitEventType } from '@creit-tech/stellar-wallets-kit/types';
import { initializeWalletKit, isWalletKitInitialized, getInitializationError } from '@/lib/wallet';
import useGlobalAuthenticationStore from '@/store/wallet.store';

/**
 * Checks if an error should be silently ignored (user cancellation).
 * Returns true for null, undefined, empty objects, or errors without meaningful content.
 */
const isSilentError = (error: unknown): boolean => {
  if (error === null || error === undefined) {
    return true;
  }

  if (typeof error === 'string') {
    return false;
  }

  if (error instanceof Error) {
    return !error.message;
  }

  if (typeof error !== 'object') {
    return false;
  }

  const errorObj = error as Record<string, unknown>;

  // Check for meaningful error properties first (most common case)
  const hasMessage = typeof errorObj.message === 'string' && errorObj.message.length > 0;
  const hasError = typeof errorObj.error === 'string' && errorObj.error.length > 0;
  if (hasMessage || hasError) {
    return false;
  }

  // Check if object is empty via stringification (handles circular refs gracefully)
  try {
    const stringified = JSON.stringify(error);
    if (stringified === '{}' || stringified === '') {
      return true;
    }
  } catch {
    // If stringify fails, fall through to property check
  }

  // Final check: empty object (no enumerable properties beyond constructor)
  const keys = Object.keys(errorObj);
  const ownProps = Object.getOwnPropertyNames(errorObj);
  return keys.length === 0 && ownProps.length <= 1;
};

/**
 * Extracts a meaningful error message from various error types.
 * Falls back to a default message if no message can be extracted.
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    if (typeof errorObj.message === 'string' && errorObj.message) {
      return errorObj.message;
    }
    
    if (typeof errorObj.error === 'string' && errorObj.error) {
      return errorObj.error;
    }
  }

  return 'Failed to connect wallet. Please try again.';
};

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
      try {
        initializeWalletKit();
      } catch (initError) {
        console.error('Failed to initialize wallet kit:', initError);
        throw new Error('Failed to initialize wallet. Please refresh the page and try again.');
      }

      // Verify initialization was successful
      if (!isWalletKitInitialized()) {
        const initError = getInitializationError();
        throw new Error(
          initError?.message || 'Wallet kit is not initialized. Please refresh the page and try again.'
        );
      }

      // Add modal class to body for styling
      document.body.classList.add('stellar-wallets-kit-modal-open');
      
      try {
        await StellarWalletsKit.authModal();
      } finally {
        // Remove modal class after a short delay to allow for animations
        setTimeout(() => {
          document.body.classList.remove('stellar-wallets-kit-modal-open');
        }, 300);
      }
    } catch (error) {
      // Silently handle empty/null errors (user cancellation, etc.)
      if (isSilentError(error)) {
        updateConnectionStatus(false);
        return;
      }

      // Extract and throw meaningful error message
      const errorMessage = extractErrorMessage(error);
      updateConnectionStatus(false);
      throw new Error(errorMessage);
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
      throw error;
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
