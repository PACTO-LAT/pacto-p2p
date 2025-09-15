import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type State = {
  address: string;
  network: 'testnet' | 'mainnet' | '';
  walletType: string;
  isConnected: boolean;
  publicKey: string;
  passkeyContractId?: string;
  passkeyKeyId?: string;
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
  setPasskeyConnection: (data: { contractId: string; keyId: string }) => void;
}

const useGlobalAuthenticationStore = create<AuthenticationStore>()(
  persist(
    (set) => ({
      address: '',
      network: '',
      walletType: '',
      isConnected: false,
      publicKey: '',
      passkeyContractId: undefined,
      passkeyKeyId: undefined,
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
          passkeyContractId: undefined,
          passkeyKeyId: undefined,
        }),
      updateConnectionStatus: (isConnected: boolean) => set({ isConnected }),
      setPasskeyConnection: ({ contractId, keyId }) =>
        set({ passkeyContractId: contractId, passkeyKeyId: keyId }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGlobalAuthenticationStore;
