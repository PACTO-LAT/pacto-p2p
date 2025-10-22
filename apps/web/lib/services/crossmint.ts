/** biome-ignore-all lint/complexity/noStaticOnlyClass: Service class with static methods */
import { CROSSMINT_CONFIG } from '@/lib/crossmint';

export interface CrossmintWalletInfo {
  address: string;
  chain: string;
  balance?: {
    [token: string]: string;
  };
}

export interface CrossmintTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export class CrossmintService {
  private static readonly API_BASE = 'https://api.crossmint.com/v1';

  /**
   * Get wallet balance using Crossmint wallet instance
   */
  static async getWalletBalance(
    wallet: { balances: (tokens?: string[]) => Promise<unknown> },
    tokens?: string[]
  ): Promise<{ [token: string]: string }> {
    try {
      if (!wallet || !wallet.balances) {
        throw new Error('Wallet not available or balances method not found');
      }

      const balances = await wallet.balances(tokens);
      
      // Convert Crossmint balance format to our format
      const result: { [token: string]: string } = {};
      
      // Handle different response formats
      if (Array.isArray(balances)) {
        // If balances is an array
        console.log('Balances is array:', balances);
        balances.forEach((token: any) => {
          if (token && token.symbol && token.amount !== undefined) {
            result[token.symbol] = token.amount.toString();
          }
        });
      } else if (balances && typeof balances === 'object') {
        // If balances is an object
        const balanceObj = balances as any;
        console.log('Balances is object:', balanceObj);
        
        // Check for native token
        if (balanceObj.nativeToken) {
          console.log('Native token found:', balanceObj.nativeToken);
          result[balanceObj.nativeToken.symbol] = balanceObj.nativeToken.amount;
        }
        
        // Check for USDC
        if (balanceObj.usdc) {
          console.log('USDC found:', balanceObj.usdc);
          result[balanceObj.usdc.symbol] = balanceObj.usdc.amount;
        }
        
        // Check for tokens array
        if (balanceObj.tokens && Array.isArray(balanceObj.tokens)) {
          console.log('Tokens array found:', balanceObj.tokens);
          balanceObj.tokens.forEach((token: any) => {
            console.log('Processing token:', token);
            result[token.symbol] = token.amount;
          });
        }
        
        // Check for direct key-value pairs
        Object.entries(balanceObj).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            console.log(`Direct balance found: ${key} = ${value}`);
            result[key] = value.toString();
          }
        });
      }
      
      console.log('Final processed result:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  static async getWalletTransactions(
    walletAddress: string,
    limit = 50
  ): Promise<CrossmintTransaction[]> {
    try {
      const response = await fetch(
        `${CrossmintService.API_BASE}/wallets/${walletAddress}/transactions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${CROSSMINT_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  }

  /**
   * Send tokens using Crossmint wallet instance
   */
  static async sendTokens(
    wallet: any,
    toWallet: string,
    tokenLocator: string,
    amount: string
  ): Promise<{ hash: string; explorerLink: string }> {
    try {
      if (!wallet || !wallet.send) {
        throw new Error('Wallet not available or send method not found');
      }

      const result = await wallet.send(toWallet, tokenLocator, amount);
      
      return {
        hash: result.hash,
        explorerLink: result.explorerLink,
      };
    } catch (error) {
      console.error('Error sending tokens:', error);
      throw error;
    }
  }

  /**
   * Send transaction using StellarWallet for contract calls
   */
  static async sendStellarTransaction(
    wallet: any,
    contractId: string,
    method: string,
    args: Record<string, any>
  ): Promise<{ hash: string; explorerLink: string }> {
    try {
      if (!wallet) {
        throw new Error('Wallet not available');
      }

      // Import StellarWallet dynamically to avoid SSR issues
      const { StellarWallet } = await import('@crossmint/client-sdk-react-ui');
      const stellarWallet = StellarWallet.from(wallet);

      const result = await stellarWallet.sendTransaction({
        contractId,
        method,
        args
      });
      
      return {
        hash: result.hash,
        explorerLink: result.explorerLink,
      };
    } catch (error) {
      console.error('Error sending Stellar transaction:', error);
      throw error;
    }
  }

  /**
   * Send escrow transaction using Crossmint wallet
   * This method handles the XDR transaction from TrustlessWork API
   */
  static async sendEscrowTransaction(
    wallet: any,
    unsignedTransaction: string,
    method: string
  ): Promise<{ hash: string; explorerLink: string }> {
    try {
      if (!wallet) {
        throw new Error('Crossmint wallet not available');
      }

      const { StellarWallet } = await import('@crossmint/client-sdk-react-ui');
      const stellarWallet = StellarWallet.from(wallet);
      
      // The unsignedTransaction is an XDR that needs to be signed and submitted
      // We'll use sendTransaction with the XDR as contractId
      const result = await stellarWallet.sendTransaction({
        contractId: unsignedTransaction,
        method,
        args: {}
      });

      if (!result.hash) {
        throw new Error('Transaction failed to send');
      }

      return {
        hash: result.hash,
        explorerLink: result.explorerLink,
      };
    } catch (error) {
      console.error('Error sending escrow transaction:', error);
      throw error;
    }
  }

  /**
   * Get supported tokens for the Stellar network
   */
  static async getSupportedTokens(): Promise<Array<{
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  }>> {
    try {
      const response = await fetch(
        `${CrossmintService.API_BASE}/chains/stellar/tokens`,
        {
          headers: {
            'Authorization': `Bearer ${CROSSMINT_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch supported tokens: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      throw error;
    }
  }

  /**
   * Validate a Stellar address
   */
  static isValidStellarAddress(address: string): boolean {
    // Basic Stellar address validation
    const stellarAddressRegex = /^G[A-Z0-9]{55}$/;
    return stellarAddressRegex.test(address);
  }

  /**
   * Format wallet address for display
   */
  static formatAddress(address: string, startChars = 8, endChars = 8): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }
}
