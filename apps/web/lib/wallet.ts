import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';

// Initialize flag to prevent multiple initializations
let isInitialized = false;
let initializationError: Error | null = null;

// Initialize the kit (should be called once on client-side)
export function initializeWalletKit(): void {
  if (typeof window === 'undefined') {
    return; // Skip on server-side
  }

  if (!isInitialized) {
    try {
      StellarWalletsKit.init({
        modules: defaultModules(),
        network: Networks.TESTNET,
      });
      isInitialized = true;
      initializationError = null;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to initialize StellarWalletsKit';
      initializationError = new Error(errorMessage);
      console.error('Failed to initialize StellarWalletsKit:', {
        error,
        message: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      throw initializationError;
    }
  }
}

// Check if the kit is initialized
export function isWalletKitInitialized(): boolean {
  return isInitialized;
}

// Get initialization error if any
export function getInitializationError(): Error | null {
  return initializationError;
}

// Get the kit instance (for backward compatibility if needed)
export function getKit() {
  if (typeof window === 'undefined') {
    throw new Error('StellarWalletsKit can only be used on the client side');
  }
  
  if (!isInitialized) {
    initializeWalletKit();
  }
  
  return StellarWalletsKit;
}

interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async ({
  unsignedTransaction,
  address,
}: signTransactionProps): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('signTransaction can only be called on the client side');
  }

  if (!isInitialized) {
    initializeWalletKit();
  }

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: Networks.TESTNET,
  });

  return signedTxXdr;
};


