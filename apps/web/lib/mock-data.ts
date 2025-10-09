import type {
  DashboardEscrow,
  DashboardListing,
  MarketplaceListing,
} from '@/lib/types';

// Mock listings data
export const mockListings: DashboardListing[] = [
  {
    id: '1',
    type: 'sell',
    token: 'CRCX',
    amount: 1000,
    rate: 520.5,
    fiatCurrency: 'CRC',
    status: 'active',
    created: '2024-01-15',
  },
  {
    id: '2',
    type: 'buy',
    token: 'USDC',
    amount: 500,
    rate: 1.02,
    fiatCurrency: 'CRC',
    status: 'pending',
    created: '2024-01-14',
  },
];

// Mock escrows data
export const mockEscrows: DashboardEscrow[] = [
  {
    id: 'ESC001',
    type: 'sell',
    token: 'CRCX',
    amount: 500,
    buyer: '0x1234...5678',
    status: 'awaiting_payment',
    progress: 25,
    created: '2024-01-15',
  },
  {
    id: 'ESC002',
    type: 'buy',
    token: 'USDC',
    amount: 250,
    seller: '0x8765...4321',
    status: 'payment_confirmed',
    progress: 75,
    created: '2024-01-14',
  },
];

//! Mock marketplace listings - @joel And @bran18
export const mockMarketplaceListings: MarketplaceListing[] = [
  {
    id: 1, // MarketplaceListing expects a number id
    type: 'sell',
    token: 'CRCX',
    amount: 10,
    rate: 520.5,
    fiatCurrency: 'CRC',
    paymentMethod: 'SINPE',
    seller: 'GCNN2B23WJT5ZZ25FGK7M6N44SI3S7KUSM6J4GKEHMVN7VDYGC336XPN',
    buyer: 'GCNN2B23WJT5ZZ25FGK7M6N44SI3S7KUSM6J4GKEHMVN7VDYGC336XPN',
    reputation: 4.8,
    trades: 23,
    created: '2024-01-15',
    status: 'active',
    description: 'XXXXXXXXXXXXXXXXXXX',
  },
];

// Mock user data
export const mockUserData = {
  id: 'user_123',
  email: 'user@example.com',
  full_name: 'Juan Pérez',
  username: 'juanperez',
  bio: 'Experienced trader in Stellar ecosystem. Focused on USDC and EURC trading.',
  avatar_url: '',
  stellar_address: 'GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  phone: '+1234567890',
  country: 'Mexico',
  kyc_status: 'verified' as 'pending' | 'verified' | 'rejected',
  reputation_score: 4.8,
  total_trades: 127,
  total_volume: 45000,
  created_at: '2024-01-15',
  notifications: {
    email_trades: true,
    email_escrows: true,
    push_notifications: true,
    sms_notifications: false,
  },
  security: {
    two_factor_enabled: true,
    login_notifications: true,
  },
  payment_methods: {
    sinpe_number: '+50612345678',
    bank_iban: 'CR05015202001026284066',
    bank_name: 'Banco Nacional de Costa Rica',
    bank_account_holder: 'Juan Pérez',
    preferred_method: 'sinpe' as 'sinpe' | 'bank_transfer',
  },
};

// Mock tokens data
export const mockTokens = [
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

// Mock transactions data
export const mockTransactions = [
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

// Mock platform stats
export const mockPlatformStats = {
  totalUsers: 1247,
  activeListings: 23,
  totalVolume: 2450000,
  completedTrades: 156,
};

// Mock supported assets
export const mockSupportedAssets = [
  {
    symbol: 'CRCX',
    name: 'Costa Rican Colón Token',
    region: 'Costa Rica',
    paymentMethods: 'SINPE',
    color: 'bg-green-500',
  },
  {
    symbol: 'MXNX',
    name: 'Mexican Peso Token',
    region: 'Mexico',
    paymentMethods: 'SPEI, OXXO (coming)',
    color: 'bg-red-500',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    region: 'Global',
    paymentMethods: 'Varies',
    color: 'bg-emerald-600',
  },
];

// Mock tech stack
export const mockTechStack = [
  { name: 'Next.js', description: 'High-performance frontend' },
  { name: 'Trustless Work', description: 'Escrow logic on Stellar' },
  {
    name: 'Supabase',
    description: 'Backend for users, listings, and storage',
  },
  { name: 'TanStack', description: 'State and async data handling' },
];
