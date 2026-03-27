import { supabase } from '@/lib/supabase';
import type { MerchantAdapter } from '@/lib/adapters/merchant';
import type {
  Merchant,
  MerchantVerificationStatus,
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';

type MerchantRow = {
  id: string;
  slug: string | null;
  display_name: string;
  is_public: boolean | null;
  verification_status?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  location?: string | null;
  languages?: unknown;
  socials?: unknown;
  rating?: number | null;
  total_trades?: number | null;
  volume_traded?: number | null;
};

function mapRowToMerchant(row: MerchantRow): Merchant {
  const toVerificationStatus = (v: unknown): MerchantVerificationStatus => {
    switch (v) {
      case 'pending':
      case 'verified':
      case 'rejected':
      case 'revoked':
        return v;
      default:
        return 'pending';
    }
  };
  return {
    id: row.id,
    slug: row.slug ?? '',
    display_name: row.display_name,
    is_public: row.is_public ?? true,
    verification_status: toVerificationStatus(
      row.verification_status ?? 'pending'
    ),
    bio: row.bio ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
    banner_url: row.banner_url ?? undefined,
    location: row.location ?? undefined,
    languages: Array.isArray(row.languages)
      ? (row.languages as string[])
      : undefined,
    socials: (row.socials as Merchant['socials']) ?? undefined,
    rating: Number(row.rating ?? 0),
    total_trades: Number(row.total_trades ?? 0),
    volume_traded: Number(row.volume_traded ?? 0),
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let candidate = slugify(base);
  if (!candidate) candidate = 'merchant';
  let suffix = 1;
  const MAX_ATTEMPTS = 20;
  // Try the base, then append -1,-2,... until unique
  while (suffix <= MAX_ATTEMPTS) {
    const { data, error } = await supabase
      .from('merchants')
      .select('id')
      .eq('slug', candidate)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return candidate;
    candidate = `${slugify(base) || 'merchant'}-${suffix++}`;
  }
  // Fallback: use a random suffix
  return `${slugify(base) || 'merchant'}-${Date.now().toString(36)}`;
}

/**
 * Ensure the user profile exists in the public.users table.
 * The handle_new_user trigger should create it on signup, but it may not
 * have fired (e.g. user was created before the trigger was added).
 */
async function ensureUserProfile(userId: string): Promise<void> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (data) return; // Profile exists

  // Get email from the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const email = session?.user?.email ?? `${userId}@auth.local`;

  const { error } = await supabase.from('users').insert({
    id: userId,
    email,
    reputation_score: 0,
    total_trades: 0,
    total_volume: 0,
  });

  // 23505 = unique constraint violation → profile already exists (race condition)
  if (error && error.code !== '23505') {
    throw new Error(error.message || 'Failed to create user profile');
  }
}

export const merchantSupabaseAdapter: MerchantAdapter = {
  async listPublicMerchants(): Promise<Merchant[]> {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRowToMerchant);
  },

  async getPublicMerchantBySlug(slug: string): Promise<Merchant | null> {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single();
    if (error) {
      const e = error as unknown as {
        code?: string;
        details?: string;
        message?: string;
      };
      if (e.code === 'PGRST116') return null;
      if (e.details?.includes('Results contain 0')) return null;
      if (e.message?.includes('No rows')) return null;
      throw new Error(error.message);
    }
    return data ? mapRowToMerchant(data) : null;
  },

  
async getBadges(merchantId: string): Promise<MerchantBadge[]> {
    const kpis = await this.getKpis(merchantId);
    const badges: MerchantBadge[] = [];
    const now = new Date().toISOString();

    // 1. First Listing (Existing)
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);

    if ((listingsCount ?? 0) >= 1) {
      badges.push({
        id: 'first-listing',
        code: 'first-listing',
        title: 'First Listing',
        description: 'Posted your first listing',
        kind: 'programmatic',
        earned_at: now,
      });
    }

    // 2. First Trade
    if (kpis.completed_trades >= 1) {
      badges.push({
        id: 'first-trade',
        code: 'first-trade',
        title: 'First Trade',
        description: 'Completed your first successful trade',
        kind: 'programmatic',
        earned_at: now,
      });
    }

    // 3. Trusted 100
    if (kpis.completed_trades >= 100) {
      badges.push({
        id: 'trusted-100',
        code: 'trusted-100',
        title: 'Trusted 100',
        description: 'Completed 100+ successful trades',
        kind: 'programmatic',
        earned_at: now,
      });
    }

    // 4. Low Dispute (Under 1% dispute rate with 20+ trades)
    if (kpis.dispute_rate_pct < 1 && kpis.total_trades >= 20) {
      badges.push({
        id: 'low-dispute',
        code: 'low-dispute',
        title: 'Low Dispute Rate',
        description: 'Maintains a dispute rate below 1% with 20+ trades',
        kind: 'programmatic',
        earned_at: now,
      });
    }

    // 5. High Volume ($10,000+ traded)
    if (kpis.volume_30d >= 10000) {
      badges.push({
        id: 'high-volume',
        code: 'high-volume',
        title: 'High Volume Trader',
        description: 'Traded $10,000+ in the last 30 days',
        kind: 'programmatic',
        earned_at: now,
      });
    }

    return badges;
  },

  async getKpis(merchantId: string): Promise<MerchantKpis> {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('user_id')
      .eq('id', merchantId)
      .single();

    if (!merchant) throw new Error('Merchant not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalRes, completedRes, disputedRes, volumeRes, speedRes] = await Promise.all([
      supabase.from('trades').select('id', { count: 'exact', head: true })
        .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`),
      supabase.from('trades').select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`),
      supabase.from('trades').select('id', { count: 'exact', head: true })
        .eq('status', 'disputed')
        .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`),
      supabase.from('trades').select('fiat_amount')
        .eq('status', 'completed')
        .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('trades').select('created_at, completed_at')
        .eq('status', 'completed')
        .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`)
        .not('completed_at', 'is', null),
    ]);

    if (totalRes.error) throw new Error(totalRes.error.message);

    const total = totalRes.count ?? 0;
    const completed = completedRes.count ?? 0;
    const disputed = disputedRes.count ?? 0;
    const volume_30d = (volumeRes.data ?? []).reduce(
      (acc: number, curr: { fiat_amount: string | number }) => acc + Number(curr.fiat_amount),
      0
    );

    let median_release_minutes: number | null = null;
    if (speedRes.data && speedRes.data.length > 0) {
      const diffs = speedRes.data
        .map(r => (new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime()) / 60000)
        .sort((a, b) => a - b);
      const mid = Math.floor(diffs.length / 2);
      median_release_minutes = diffs.length % 2 !== 0 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;
    }

    return {
      total_trades: total,
      completed_trades: completed,
      disputed_trades: disputed,
      completion_rate_pct: total ? Math.round((completed / total) * 100) : 0,
      dispute_rate_pct: total ? Math.round((disputed / total) * 100) : 0,
      volume_30d,
      median_release_minutes,
    };
  },

  async getVolumeSeries(merchantId: string): Promise<VolumePoint[]> {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('user_id')
      .eq('id', merchantId)
      .single();
    if (!merchant) return [];

    const { data, error } = await supabase
      .from('trades')
      .select('created_at, fiat_amount')
      .eq('status', 'completed')
      .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    const seriesMap = new Map<string, number>();
    data.forEach(row => {
      const date = row.created_at.split('T')[0];
      seriesMap.set(date, (seriesMap.get(date) ?? 0) + Number(row.fiat_amount));
    });

    return Array.from(seriesMap.entries()).map(([date, volume]) => ({ d: date, volume }));
  },

  async getSpeedHistogram(merchantId: string): Promise<SpeedBucket[]> {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('user_id')
      .eq('id', merchantId)
      .single();
    if (!merchant) return [];

    const { data } = await supabase
      .from('trades')
      .select('created_at, completed_at')
      .eq('status', 'completed')
      .or(`seller_id.eq.${merchant.user_id},buyer_id.eq.${merchant.user_id}`)
      .not('completed_at', 'is', null);

    if (!data) return [];

    const buckets: Record<string, number> = {
      '< 5m': 0,
      '5-15m': 0,
      '15-30m': 0,
      '30-60m': 0,
      '> 60m': 0,
    };

    data.forEach(r => {
      const mins = (new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime()) / 60000;
      if (mins < 5) buckets['< 5m']++;
      else if (mins < 15) buckets['5-15m']++;
      else if (mins < 30) buckets['15-30m']++;
      else if (mins < 60) buckets['30-60m']++;
      else buckets['> 60m']++;
    });

    return Object.entries(buckets).map(([bucketLabel, count]) => ({ bucketLabel, count }));
  },

  async getActiveListings(merchantId: string): Promise<MerchantListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    return rows.map((r: {
      id: string;
      type: string;
      token: string;
      rate: string | number;
      fiat_currency: string;
      amount: string | number;
      min_amount: string | number | null;
      max_amount: string | number | null;
      description: string | null;
      status: string;
      created_at: string;
    }) => ({
      id: r.id,
      side: r.type,
      asset_code: r.token,
      price_rate: Number(r.rate),
      quote_currency: r.fiat_currency,
      amount: Number(r.amount),
      min_amount: r.min_amount ? Number(r.min_amount) : undefined,
      max_amount: r.max_amount ? Number(r.max_amount) : undefined,
      description: r.description ?? undefined,
      status: r.status,
      created_at: r.created_at,
      payment_methods: [],
    }));
  },

  async getMyMerchant(): Promise<Merchant | null> {
    const userId = await resolveCurrentUserId();
    if (!userId) return null;
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      const e = error as unknown as {
        code?: string;
        details?: string;
        message?: string;
      };
      if (e.code === 'PGRST116') return null;
      if (e.details?.includes('Results contain 0')) return null;
      if (e.message?.includes('No rows')) return null;
      throw new Error(error.message);
    }
    return data ? mapRowToMerchant(data) : null;
  },

  async upsertMyMerchantProfile(input) {
    const userId = await resolveCurrentUserId();
    if (!userId)
      throw new Error(
        'Not authenticated — please sign in with email before saving your merchant profile'
      );

    // Ensure user profile exists in the users table (trigger may not have fired)
    await ensureUserProfile(userId);

    const { data: existing, error: existingError } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing merchant:', existingError);
      // PGRST116 = 0 rows with .single(), safe to ignore for maybeSingle
      if (existingError.code !== 'PGRST116') {
        throw new Error(
          existingError.message || 'Failed to check existing merchant profile'
        );
      }
    }

    const desiredSlug = input.slug || input.display_name;
    const finalSlug = existing?.slug
      ? existing.slug
      : desiredSlug
        ? await ensureUniqueSlug(desiredSlug)
        : null;

    const canReapply =
      existing?.id &&
      (existing.verification_status === 'rejected' ||
        existing.verification_status === 'revoked');

    const payload = {
      user_id: userId,
      display_name: input.display_name,
      bio: input.bio ?? null,
      location: input.location ?? null,
      languages: input.languages ?? [],
      socials: input.socials ?? {},
      is_public: input.is_public ?? true,
      avatar_url: input.avatar_url ?? null,
      banner_url: input.banner_url ?? null,
      slug: finalSlug,
      // New applications: pending. Re-applications: reset to pending
      ...(existing?.id
        ? canReapply
          ? { verification_status: 'pending' as const }
          : {}
        : { verification_status: 'pending' as const }),
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('merchants')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error)
        throw new Error(error.message || 'Failed to update merchant profile');
      return mapRowToMerchant(data);
    }

    const { data, error } = await supabase
      .from('merchants')
      .insert(payload)
      .select('*')
      .single();
    if (error)
      throw new Error(error.message || 'Failed to create merchant profile');
    return mapRowToMerchant(data);
  },

  async createMerchantListing(payload) {
    const userId = await resolveCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const insert = {
      type: payload.side,
      token: payload.asset_code,
      rate: payload.price_rate,
      fiat_currency: payload.quote_currency,
      amount: payload.amount,
      min_amount: payload.min_amount ?? null,
      max_amount: payload.max_amount ?? null,
      description: payload.description ?? null,
      status: 'active',
      merchant_id: merchant?.id ?? null,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    return {
      id: data.id,
      side: data.type,
      asset_code: data.token,
      price_rate: Number(data.rate),
      quote_currency: data.fiat_currency,
      amount: Number(data.amount),
      min_amount: data.min_amount ? Number(data.min_amount) : undefined,
      max_amount: data.max_amount ? Number(data.max_amount) : undefined,
      description: data.description ?? undefined,
      status: data.status,
      created_at: data.created_at,
      payment_methods: [],
    } as MerchantListing;
  },

  async getMyListings(): Promise<MerchantListing[]> {
    const userId = await resolveCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((r: {
      id: string;
      type: string;
      token: string;
      rate: string | number;
      fiat_currency: string;
      amount: string | number;
      min_amount: string | number | null;
      max_amount: string | number | null;
      description: string | null;
      status: string;
      created_at: string;
    }) => ({
      id: r.id,
      side: r.type,
      asset_code: r.token,
      price_rate: Number(r.rate),
      quote_currency: r.fiat_currency,
      amount: Number(r.amount),
      min_amount: r.min_amount ? Number(r.min_amount) : undefined,
      max_amount: r.max_amount ? Number(r.max_amount) : undefined,
      description: r.description ?? undefined,
      status: r.status,
      created_at: r.created_at,
      payment_methods: [],
    }));
  },
};

async function resolveCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    // Fallback: hit the server directly in case local session is stale
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
