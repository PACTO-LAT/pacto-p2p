import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { kit } from "@/lib/wallet";
import useGlobalAuthenticationStore from "@/store/wallet.store";

export const useWallet = () => {
  const { connectWalletStore, disconnectWalletStore, updateConnectionStatus } =
    useGlobalAuthenticationStore();

  const connectWallet = async () => {
    try {
      await kit.openModal({
        modalTitle: "Connect to your favorite wallet",
        onWalletSelected: async (option: ISupportedWallet) => {
          try {
            kit.setWallet(option.id);
            
            // Wait for the wallet to be properly set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const { address } = await kit.getAddress();
            
            if (address) {
              // Get additional wallet information
              // Since we're using TESTNET in the kit configuration, we can hardcode this for now
              const network = "testnet" as const;
              const walletType = option.name || option.id;
              const publicKey = address; // In Stellar, the address is the public key
              
              connectWalletStore(address, network, walletType, publicKey);
              updateConnectionStatus(true);
              
              // Add a small delay to ensure the store is updated
              await new Promise(resolve => setTimeout(resolve, 200));
            } else {
              throw new Error("Failed to get wallet address");
            }
          } catch (error) {
            console.error("Error in wallet selection:", error);
            updateConnectionStatus(false);
            throw error;
          }
        },
      });
    } catch (error) {
      console.error("Error opening wallet modal:", error);
      updateConnectionStatus(false);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await kit.disconnect();
      disconnectWalletStore();
      updateConnectionStatus(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw error;
    }
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // You might want to show a toast notification here
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // You might want to show a toast notification here
    }
  };

  return {
    handleConnect,
    handleDisconnect,
  };
};
