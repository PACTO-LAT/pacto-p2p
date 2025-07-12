import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  address: string;
};

interface AuthenticationStore extends State {
  connectWalletStore: (address: string) => void;
  disconnectWalletStore: () => void;
}

const useGlobalAuthenticationStore = create<AuthenticationStore>()(
  persist(
    (set) => ({
      address: "",
      connectWalletStore: (address: string) => set({ address }),
      disconnectWalletStore: () => set({ address: "" }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGlobalAuthenticationStore;
