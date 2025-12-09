import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit/sdk';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';

// Initialize flag to prevent multiple initializations
let isInitialized = false;

// Initialize the kit (should be called once on client-side)
export function initializeWalletKit() {
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
    } catch (error) {
      console.error('Failed to initialize StellarWalletsKit:', error);
    }
  }
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
