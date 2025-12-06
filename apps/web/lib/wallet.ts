import {
  FREIGHTER_ID,
  FreighterModule,
  StellarWalletsKit,
  WalletNetwork,
} from '@creit.tech/stellar-wallets-kit';

// Singleton pattern to prevent duplicate custom element registration
let kitInstance: StellarWalletsKit | null = null;

function initializeKit(): StellarWalletsKit {
  if (typeof window === 'undefined') {
    // Server-side: throw error to prevent server-side usage
    throw new Error('StellarWalletsKit can only be used on the client side');
  }

  if (!kitInstance) {
    try {
      // Create new instance (will register custom element)
      kitInstance = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: [new FreighterModule()],
      });
    } catch (error) {
      // If custom element registration fails (already exists from hot reload),
      // suppress the error and create instance anyway
      if (
        error instanceof Error &&
        error.message.includes('already been used')
      ) {
        console.warn(
          'Custom element already registered (likely from hot reload), continuing...'
        );
        // Try to create instance anyway - the modal might still work
        kitInstance = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: FREIGHTER_ID,
          modules: [new FreighterModule()],
        });
      } else {
        throw error;
      }
    }
  }

  return kitInstance;
}

// Lazy-loaded kit getter - only initializes when called (client-side only)
export function getKit(): StellarWalletsKit {
  return initializeKit();
}

// Export kit as a Proxy for backward compatibility
// This ensures the kit is only initialized when properties are accessed
// The Proxy safely handles SSR by returning no-ops instead of throwing
export const kit = new Proxy({} as StellarWalletsKit, {
  get(_target, prop) {
    // Always check if we're on the client side first
    if (typeof window === 'undefined') {
      // Server-side: return safe no-op functions/values
      
      // Handle symbol properties first (before converting to string)
      if (typeof prop === 'symbol' && prop === Symbol.toPrimitive) {
        // Prevent Promise-like behavior or coercion during SSR
        return undefined;
      }
      
      const propName = String(prop);
      
      // Return no-op functions for methods (won't throw until called)
      if (
        ['openModal', 'signTransaction', 'getAddress', 'setWallet', 'disconnect', 'signTransaction'].includes(propName)
      ) {
        return async (..._args: unknown[]) => {
          // This will only throw if actually called on server (shouldn't happen)
          throw new Error('StellarWalletsKit methods can only be called on the client side');
        };
      }
      
      // Return safe defaults for other properties
      if (propName === 'then') {
        // Prevent Promise-like behavior during SSR
        return undefined;
      }
      
      return undefined;
    }
    
    // Client-side: initialize and return the actual value
    try {
      const instance = initializeKit();
      const value = instance[prop as keyof StellarWalletsKit];
      
      // If it's a function, bind it to the instance
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      
      return value;
    } catch (error) {
      // If initialization fails, return a safe fallback
      console.error('Failed to initialize StellarWalletsKit:', error);
      return undefined;
    }
  },
});

interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async ({
  unsignedTransaction,
  address,
}: signTransactionProps): Promise<string> => {
  // Get kit instance lazily (client-side only)
  const kitInstance = initializeKit();
  const { signedTxXdr } = await kitInstance.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  return signedTxXdr;
};
