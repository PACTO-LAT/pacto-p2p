import type { MerchantApplication } from '@/lib/types/admin';

// Mock merchant applications database
const mockApplications: MerchantApplication[] = [
  {
    id: 'app-001',
    user_id: 'user-001',
    slug: 'alice-otc',
    display_name: 'Alice OTC',
    verification_status: 'verified',
    bio: 'Trusted CRCX/USDC trader in Costa Rica. Fast and reliable transactions via SINPE.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    banner_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    location: 'San José, CR',
    languages: ['es', 'en'],
    socials: {
      twitter: '@aliceotc',
      telegram: '@aliceotc',
    },
    rating: 4.8,
    total_trades: 23,
    volume_traded: 15000,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-001',
      email: 'alice@example.com',
      full_name: 'Alice Demo',
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'app-002',
    user_id: 'user-002',
    slug: 'bob-exchange',
    display_name: 'Bob Exchange',
    verification_status: 'verified',
    bio: 'Fast MXNX/USDC swaps via SPEI. Professional trader with high volume and quick settlement.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    banner_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
    location: 'CDMX, MX',
    languages: ['es', 'en'],
    socials: {
      twitter: '@bobexchange',
      telegram: '@bobexchange',
    },
    rating: 4.9,
    total_trades: 45,
    volume_traded: 52000,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-002',
      email: 'bob@example.com',
      full_name: 'Bob Demo',
      created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'app-003',
    user_id: 'user-003',
    slug: 'charlie-trader',
    display_name: 'Charlie Trader',
    verification_status: 'pending',
    bio: 'New merchant application. Looking to provide USDC liquidity in the US market.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    location: 'New York, US',
    languages: ['en'],
    socials: {
      website: 'https://charlietrader.com',
    },
    rating: 0,
    total_trades: 0,
    volume_traded: 0,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-003',
      email: 'charlie@example.com',
      full_name: 'Charlie Demo',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'app-004',
    user_id: 'user-004',
    slug: 'diana-premium',
    display_name: 'Diana Premium Trading',
    verification_status: 'verified',
    bio: 'Premium merchant specializing in CRCX. Verified and trusted with excellent reputation.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    banner_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    location: 'San José, CR',
    languages: ['es', 'en', 'pt'],
    socials: {
      twitter: '@dianapremium',
      telegram: '@dianapremium',
    },
    rating: 4.95,
    total_trades: 67,
    volume_traded: 89000,
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-004',
      email: 'diana@example.com',
      full_name: 'Diana Demo',
      created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'app-005',
    user_id: 'user-005',
    slug: 'eve-crypto',
    display_name: 'Eve Crypto Exchange',
    verification_status: 'pending',
    bio: 'Crypto exchange looking to expand into P2P trading. Specializing in MXNX.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
    banner_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200',
    location: 'Guadalajara, MX',
    languages: ['es', 'en'],
    socials: {
      twitter: '@evecrypto',
      website: 'https://evecrypto.mx',
    },
    rating: 0,
    total_trades: 0,
    volume_traded: 0,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-005',
      email: 'eve@example.com',
      full_name: 'Eve Demo',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

export function getMerchantApplications(status?: string): MerchantApplication[] {
  if (!status || status === 'all') {
    return mockApplications;
  }
  return mockApplications.filter((app) => app.verification_status === status);
}

export function getMerchantApplicationById(id: string): MerchantApplication | null {
  return mockApplications.find((app) => app.id === id) || null;
}

export function approveMerchant(id: string): MerchantApplication {
  const app = mockApplications.find((a) => a.id === id);
  if (!app) throw new Error('Application not found');
  
  app.verification_status = 'verified';
  app.updated_at = new Date().toISOString();
  return app;
}

export function rejectMerchant(id: string): MerchantApplication {
  const app = mockApplications.find((a) => a.id === id);
  if (!app) throw new Error('Application not found');
  
  app.verification_status = 'rejected';
  app.updated_at = new Date().toISOString();
  return app;
}

export function revokeMerchant(id: string): MerchantApplication {
  const app = mockApplications.find((a) => a.id === id);
  if (!app) throw new Error('Application not found');
  
  app.verification_status = 'revoked';
  app.updated_at = new Date().toISOString();
  return app;
}
