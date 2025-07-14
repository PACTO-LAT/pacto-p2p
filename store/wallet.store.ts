import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  address: string;
  network: 'testnet' | 'mainnet' | '';
  walletType: string;
  isConnected: boolean;
  publicKey: string;
};

interface AuthenticationStore extends State {
  connectWalletStore: (
    address: string,
    network: 'testnet' | 'mainnet',
    walletType: string,
    publicKey: string
  ) => void;
  disconnectWalletStore: () => void;
  updateConnectionStatus: (isConnected: boolean) => void;
}

const useGlobalAuthenticationStore = create<AuthenticationStore>()(
  persist(
    (set) => ({
      address: '',
      network: '',
      walletType: '',
      isConnected: false,
      publicKey: '',
      connectWalletStore: (
        address: string,
        network: 'testnet' | 'mainnet',
        walletType: string,
        publicKey: string
      ) =>
        set({
          address,
          network,
          walletType,
          publicKey,
          isConnected: true,
        }),
      disconnectWalletStore: () =>
        set({
          address: '',
          network: '',
          walletType: '',
          publicKey: '',
          isConnected: false,
        }),
      updateConnectionStatus: (isConnected: boolean) => set({ isConnected }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGlobalAuthenticationStore;
