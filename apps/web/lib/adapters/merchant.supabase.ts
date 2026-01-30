import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/services/auth';
import useGlobalAuthenticationStore from '@/store/wallet.store';
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
  let suffix = 1;
  // Try the base, then append -1,-2,... until unique
  while (true) {
    const { data, error } = await supabase
      .from('merchants')
      .select('id')
      .eq('slug', candidate)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${slugify(base)}-${suffix++}`;
  }
}

export const merchantSupabaseAdapter: MerchantAdapter = {
  async listPublicMerchants(): Promise<Merchant[]> {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
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
      throw error;
    }
    return data ? mapRowToMerchant(data) : null;
  },

  async getBadges(merchantId: string): Promise<MerchantBadge[]> {
    // Placeholder: compute simple badges from listings count
    const { count, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);
    if (error) throw error;
    const badges: MerchantBadge[] = [];
    if ((count ?? 0) >= 1) {
      badges.push({
        id: 'first-listing',
        code: 'first-listing',
        title: 'First Listing',
        description: 'Posted your first listing',
        kind: 'programmatic',
        earned_at: new Date().toISOString(),
      });
    }
    return badges;
  },

  async getKpis(merchantId: string): Promise<MerchantKpis> {
    // Compute from listings table as a proxy (until trades/escrows table is wired)
    const { count: total, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchantId);
    if (error) throw error;
    return {
      total_trades: total ?? 0,
      completed_trades: 0,
      disputed_trades: 0,
      completion_rate_pct: 0,
      dispute_rate_pct: 0,
      volume_30d: 0,
      median_release_minutes: null,
    };
  },

  async getVolumeSeries(_merchantId: string): Promise<VolumePoint[]> {
    void _merchantId;
    return [];
  },

  async getSpeedHistogram(_merchantId: string): Promise<SpeedBucket[]> {
    void _merchantId;
    return [];
  },

  async getActiveListings(merchantId: string): Promise<MerchantListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = data ?? [];
    return rows.map((r) => ({
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
      throw error;
    }
    return data ? mapRowToMerchant(data) : null;
  },

  async upsertMyMerchantProfile(input) {
    const userId = await resolveCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const desiredSlug = input.slug || input.display_name;
    const finalSlug = existing?.slug
      ? existing.slug
      : desiredSlug
        ? await ensureUniqueSlug(desiredSlug)
        : null;

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
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('merchants')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return mapRowToMerchant(data);
    }

    const insertPayload = {
      ...payload,
      verification_status: 'pending',
    };

    const { data, error } = await supabase
      .from('merchants')
      .insert(insertPayload)
      .select('*')
      .single();
    if (error) throw error;
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
    if (error) throw error;

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
    if (error) throw error;

    return (data ?? []).map((r) => ({
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
    const { data: auth } = await supabase.auth.getUser();
    const authId = auth.user?.id;
    if (authId) return authId;
  } catch {
    // ignore and try wallet fallback
  }

  try {
    const { address, isConnected } = useGlobalAuthenticationStore.getState();
    if (isConnected && address) {
      const profile = await AuthService.ensureUserProfileByWallet(address);
      return profile.id;
    }
  } catch {
    // ignore
  }

  return null;
}
