import type {
  Merchant,
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';

type Db = {
  merchants: Record<string, Merchant>;
  merchantsBySlug: Record<string, string>;
  badgesByMerchant: Record<string, MerchantBadge[]>;
  kpisByMerchant: Record<string, MerchantKpis>;
  volumeByMerchant: Record<string, VolumePoint[]>;
  speedByMerchant: Record<string, SpeedBucket[]>;
  listingsByMerchant: Record<string, MerchantListing[]>;
  myMerchantId: string | null;
};

const now = new Date();

function dMinus(days: number): string {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - days);
  return dt.toISOString().slice(0, 10);
}

// Seed merchants
const demoMerchant: Merchant = {
  id: 'm_demo_1',
  slug: 'demo-merchant',
  display_name: 'Demo Merchant',
  is_public: true,
  verification_status: 'verified',
  bio: 'Reliable liquidity for USDC, CRCx, and MXNx across LatAm. Fast releases.',
  avatar_url:
    'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&auto=format&fit=crop',
  banner_url:
    'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=1200&auto=format&fit=crop',
  location: 'San José, CR',
  languages: ['es', 'en'],
  socials: {
    twitter: 'https://twitter.com/example',
    telegram: 'https://t.me/example',
    website: 'https://example.com',
  },
  rating: 4.9,
  total_trades: 1320,
  volume_traded: 185000,
};

const altMerchant: Merchant = {
  id: 'm_alt_1',
  slug: 'latam-liquidity',
  display_name: 'LatAm Liquidity',
  is_public: true,
  verification_status: 'pending',
  bio: 'Payments via SPEI, ACH. Focused on USDC and CRCx pairs.',
  avatar_url:
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=200&auto=format&fit=crop',
  banner_url:
    'https://images.unsplash.com/photo-1531973968078-9bb02785f13d?q=80&w=1200&auto=format&fit=crop',
  location: 'CDMX, MX',
  languages: ['es', 'en'],
  socials: { website: 'https://latam.example.com' },
  rating: 4.7,
  total_trades: 420,
  volume_traded: 68000,
};

const privateMerchant: Merchant = {
  id: 'm_private_1',
  slug: 'private-pro',
  display_name: 'Private Pro',
  is_public: false,
  verification_status: 'verified',
  rating: 4.8,
  total_trades: 220,
  volume_traded: 32000,
};

const seedBadges: Record<string, MerchantBadge[]> = {
  [demoMerchant.id]: [
    {
      id: 'b1',
      code: 'verified-kyc',
      title: 'KYC Verified',
      description: 'Merchant has completed identity verification.',
      earned_at: dMinus(90),
      kind: 'programmatic',
      icon_url: '/vercel.svg',
    },
    {
      id: 'b2',
      code: '100-trades',
      title: '100+ Trades',
      description: 'Completed over one hundred trades.',
      earned_at: dMinus(120),
      kind: 'programmatic',
    },
    {
      id: 'b3',
      code: 'sbt-merchant-v1',
      title: 'SBT Merchant v1',
      description: 'Soulbound token for early verified merchants.',
      earned_at: dMinus(200),
      kind: 'sbt',
    },
  ],
  [altMerchant.id]: [
    {
      id: 'b4',
      code: 'program-partner',
      title: 'Program Partner',
      description: 'Part of liquidity partner program.',
      earned_at: dMinus(60),
      kind: 'programmatic',
    },
  ],
};

const seedKpis: Record<string, MerchantKpis> = {
  [demoMerchant.id]: {
    total_trades: demoMerchant.total_trades,
    completed_trades: 1290,
    disputed_trades: 8,
    completion_rate_pct: 98.1,
    dispute_rate_pct: 0.6,
    volume_30d: 58500,
    median_release_minutes: 6,
  },
  [altMerchant.id]: {
    total_trades: altMerchant.total_trades,
    completed_trades: 410,
    disputed_trades: 6,
    completion_rate_pct: 97.2,
    dispute_rate_pct: 1.4,
    volume_30d: 22500,
    median_release_minutes: 9,
  },
};

const seedVolume = (base: number): VolumePoint[] =>
  Array.from({ length: 30 }, (_, i) => ({
    d: dMinus(29 - i),
    volume: Math.round(base * (0.8 + (i % 5) * 0.05)),
  }));

const seedSpeed: SpeedBucket[] = [
  { bucketLabel: '< 5m', count: 120 },
  { bucketLabel: '5-10m', count: 300 },
  { bucketLabel: '10-20m', count: 190 },
  { bucketLabel: '20-30m', count: 60 },
  { bucketLabel: '30m+', count: 20 },
];

const seedListings: Record<string, MerchantListing[]> = {
  [demoMerchant.id]: [
    {
      id: 'l1',
      side: 'buy',
      asset_code: 'USDC',
      price_rate: 1.0,
      quote_currency: 'USD',
      amount: 5000,
      min_amount: 50,
      max_amount: 1500,
      description: 'Fast ACH, release <10m',
      status: 'active',
      created_at: new Date().toISOString(),
      payment_methods: [{ method: 'ACH' }, { method: 'SPEI' }],
    },
    {
      id: 'l2',
      side: 'sell',
      asset_code: 'CRCx',
      price_rate: 540,
      quote_currency: 'CRC',
      amount: 200000,
      min_amount: 5000,
      max_amount: 50000,
      description: 'SINPE immediate only',
      status: 'active',
      created_at: new Date().toISOString(),
      payment_methods: [{ method: 'SINPE' }],
    },
  ],
  [altMerchant.id]: [
    {
      id: 'l3',
      side: 'sell',
      asset_code: 'USDC',
      price_rate: 17.2,
      quote_currency: 'MXN',
      amount: 80000,
      min_amount: 1000,
      max_amount: 20000,
      status: 'paused',
      created_at: new Date().toISOString(),
      payment_methods: [{ method: 'SPEI' }],
    },
  ],
};

const db: Db = {
  merchants: {
    [demoMerchant.id]: demoMerchant,
    [altMerchant.id]: altMerchant,
    [privateMerchant.id]: privateMerchant,
  },
  merchantsBySlug: {
    [demoMerchant.slug]: demoMerchant.id,
    [altMerchant.slug]: altMerchant.id,
    [privateMerchant.slug]: privateMerchant.id,
  },
  badgesByMerchant: seedBadges,
  kpisByMerchant: seedKpis,
  volumeByMerchant: {
    [demoMerchant.id]: seedVolume(1500),
    [altMerchant.id]: seedVolume(800),
  },
  speedByMerchant: {
    [demoMerchant.id]: seedSpeed,
    [altMerchant.id]: seedSpeed.map((b) => ({
      ...b,
      count: Math.round(b.count * 0.8),
    })),
  },
  listingsByMerchant: seedListings,
  myMerchantId: null,
};

export function ensureMockEnabled() {
  if (process.env.NEXT_PUBLIC_USE_MOCK !== '1') {
    throw new Error('Mock API disabled. Set NEXT_PUBLIC_USE_MOCK=1');
  }
}

export function findMerchantBySlug(slug: string): Merchant | null {
  const id = db.merchantsBySlug[slug];
  if (!id) return null;
  return db.merchants[id] ?? null;
}

export function getMerchant(id: string): Merchant | null {
  return db.merchants[id] ?? null;
}

export function listPublicMerchants(): Merchant[] {
  return Object.values(db.merchants).filter((m) => m.is_public);
}

export function getBadges(merchantId: string): MerchantBadge[] {
  return db.badgesByMerchant[merchantId] ?? [];
}

export function getKpis(merchantId: string): MerchantKpis {
  return (
    db.kpisByMerchant[merchantId] ?? {
      total_trades: 0,
      completed_trades: 0,
      disputed_trades: 0,
      completion_rate_pct: 0,
      dispute_rate_pct: 0,
      volume_30d: 0,
      median_release_minutes: null,
    }
  );
}

export function getVolume(merchantId: string): VolumePoint[] {
  return db.volumeByMerchant[merchantId] ?? [];
}

export function getSpeed(merchantId: string): SpeedBucket[] {
  return db.speedByMerchant[merchantId] ?? [];
}

export function getListings(merchantId: string): MerchantListing[] {
  return db.listingsByMerchant[merchantId] ?? [];
}

export function getMyMerchant(): Merchant | null {
  if (!db.myMerchantId) return null;
  return db.merchants[db.myMerchantId] ?? null;
}

export function upsertMyMerchantProfile(
  input: Partial<Merchant> & { display_name: string }
): Merchant {
  if (db.myMerchantId) {
    const existing = db.merchants[db.myMerchantId];
    const nextSlug = (input.slug?.trim() || existing.slug)
      .toLowerCase()
      .replace(/\s+/g, '-');
    // Enforce unique slug across merchants
    const existingIdForSlug = db.merchantsBySlug[nextSlug];
    if (existingIdForSlug && existingIdForSlug !== existing.id) {
      throw new Error('Slug already taken');
    }
    const updated: Merchant = {
      ...existing,
      ...input,
      slug: nextSlug,
    };
    db.merchants[db.myMerchantId] = updated;
    if (updated.slug !== existing.slug) {
      delete db.merchantsBySlug[existing.slug];
      db.merchantsBySlug[updated.slug] = updated.id;
    }
    return updated;
  }
  const id = 'm_me_1';
  const slug = (input.slug?.trim() || input.display_name)
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (db.merchantsBySlug[slug]) {
    throw new Error('Slug already taken');
  }
  const created: Merchant = {
    id,
    slug,
    display_name: input.display_name,
    is_public: input.is_public ?? true,
    verification_status: 'pending',
    bio: input.bio,
    avatar_url: input.avatar_url,
    banner_url: input.banner_url,
    location: input.location,
    languages: input.languages ?? [],
    socials: input.socials,
    rating: 0,
    total_trades: 0,
    volume_traded: 0,
  };
  db.myMerchantId = id;
  db.merchants[id] = created;
  db.merchantsBySlug[created.slug] = id;
  db.badgesByMerchant[id] = [];
  db.kpisByMerchant[id] = {
    total_trades: 0,
    completed_trades: 0,
    disputed_trades: 0,
    completion_rate_pct: 0,
    dispute_rate_pct: 0,
    volume_30d: 0,
    median_release_minutes: null,
  };
  db.volumeByMerchant[id] = [];
  db.speedByMerchant[id] = [];
  db.listingsByMerchant[id] = [];
  return created;
}

export function createMyListing(
  payload: Omit<MerchantListing, 'id' | 'status' | 'created_at'>
): MerchantListing {
  if (!db.myMerchantId) {
    throw new Error('No merchant profile');
  }
  const id = `l_${Date.now()}`;
  const listing: MerchantListing = {
    ...payload,
    id,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  db.listingsByMerchant[db.myMerchantId].unshift(listing);
  return listing;
}

export function getMyListings(): MerchantListing[] {
  if (!db.myMerchantId) return [];
  return db.listingsByMerchant[db.myMerchantId] ?? [];
}
