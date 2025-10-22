// Crossmint configuration
export const CROSSMINT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY,
  walletConfig: {
    chain: 'stellar', // Using Stellar as the primary chain
    signer: {
      type: 'email', // Using email for wallet creation
    },
    callbacks: {
      onWalletCreationStart: () => {
        console.log('Crossmint wallet creation started');
      },
      onTransactionStart: () => {
        console.log('Crossmint transaction started');
      },
      showPasskeyHelpers: false,
    },
    appearance: {
      spacingUnit: '8px',
      borderRadius: '8px',
      colors: {
        inputBackground: '#1a1a1a',
        buttonBackground: '#10b981',
        border: '#374151',
        background: '#111827',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        textLink: '#3b82f6',
        danger: '#ef4444',
        accent: '#10b981',
      },
    },
  },
} as const;
