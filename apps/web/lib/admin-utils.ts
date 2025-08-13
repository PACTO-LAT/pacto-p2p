import { Token, Transaction, PlatformStats, MintFormData } from '@/lib/types/admin';

export function getDefaultTokens(): Token[] {
  return [
    {
      symbol: 'CRCX',
      name: 'Costa Rican Colón Token',
      totalSupply: 1000000,
      circulating: 750000,
      issuer: 'GDXXX...XXXX',
      status: 'active',
    },
    {
      symbol: 'MXNX',
      name: 'Mexican Peso Token',
      totalSupply: 500000,
      circulating: 320000,
      issuer: 'GDYYY...YYYY',
      status: 'active',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      totalSupply: 0, // External token
      circulating: 0,
      issuer: 'External',
      status: 'supported',
    },
  ];
}

export function getDefaultTransactions(): Transaction[] {
  return [
    {
      id: 'TX001',
      type: 'mint',
      token: 'CRCX',
      amount: 10000,
      recipient: '0x1234...5678',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
    },
    {
      id: 'TX002',
      type: 'burn',
      token: 'MXNX',
      amount: 5000,
      recipient: '0x8765...4321',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'completed',
    },
    {
      id: 'TX003',
      type: 'mint',
      token: 'CRCX',
      amount: 25000,
      recipient: '0x9876...1234',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'pending',
    },
  ];
}

export function getDefaultPlatformStats(): PlatformStats {
  return {
    totalUsers: 1247,
    activeListings: 23,
    totalVolume: 2450000,
    completedTrades: 156,
  };
}

export function getDefaultMintForm(): MintFormData {
  return {
    token: '',
    amount: '',
    recipient: '',
    memo: '',
  };
}

export function validateMintForm(formData: MintFormData): string[] {
  const errors: string[] = [];
  
  if (!formData.token) {
    errors.push('Token is required');
  }
  
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!formData.recipient) {
    errors.push('Recipient address is required');
  }
  
  return errors;
}
