import type { MerchantAdapter } from '@/lib/adapters/merchant';
import type {
  Merchant,
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

const basePath = getBaseUrl();

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const merchantApiAdapter: MerchantAdapter = {
  async listPublicMerchants(): Promise<Merchant[]> {
    const res = await fetch(`${basePath}/api/mock/merchant`, {
      next: { revalidate: 30 },
    });
    return json<Merchant[]>(res);
  },
  async getPublicMerchantBySlug(slug: string): Promise<Merchant | null> {
    const res = await fetch(`${basePath}/api/mock/merchant/slug/${slug}`, {
      next: { revalidate: 30 },
    });
    if (res.status === 404) return null;
    return json<Merchant>(res);
  },
  async getBadges(merchantId: string): Promise<MerchantBadge[]> {
    const res = await fetch(
      `${basePath}/api/mock/merchant/${merchantId}/badges`,
      {
        next: { revalidate: 30 },
      }
    );
    return json<MerchantBadge[]>(res);
  },
  async getKpis(merchantId: string): Promise<MerchantKpis> {
    const res = await fetch(
      `${basePath}/api/mock/merchant/${merchantId}/kpis`,
      {
        next: { revalidate: 15 },
      }
    );
    return json<MerchantKpis>(res);
  },
  async getVolumeSeries(merchantId: string): Promise<VolumePoint[]> {
    const res = await fetch(
      `${basePath}/api/mock/merchant/${merchantId}/volume`,
      {
        next: { revalidate: 60 },
      }
    );
    return json<VolumePoint[]>(res);
  },
  async getSpeedHistogram(merchantId: string): Promise<SpeedBucket[]> {
    const res = await fetch(
      `${basePath}/api/mock/merchant/${merchantId}/speed`,
      {
        next: { revalidate: 60 },
      }
    );
    return json<SpeedBucket[]>(res);
  },
  async getActiveListings(merchantId: string): Promise<MerchantListing[]> {
    const res = await fetch(
      `${basePath}/api/mock/merchant/${merchantId}/listings`,
      { next: { revalidate: 10 } }
    );
    const all = await json<MerchantListing[]>(res);
    return all.filter((l) => l.status === 'active');
  },

  async getMyMerchant(): Promise<Merchant | null> {
    const res = await fetch(`${basePath}/api/mock/me/merchant`, {
      cache: 'no-store',
    });
    if (res.status === 404) return null;
    return json<Merchant>(res);
  },
  async upsertMyMerchantProfile(input: {
    display_name: string;
    bio?: string;
    location?: string;
    languages?: string[];
    socials?: Merchant['socials'];
    is_public?: boolean;
    avatar_url?: string;
    banner_url?: string;
    slug?: string;
  }): Promise<Merchant> {
    const res = await fetch(`${basePath}/api/mock/me/merchant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return json<Merchant>(res);
  },
  async createMerchantListing(
    payload: Omit<MerchantListing, 'id' | 'status' | 'created_at'>
  ): Promise<MerchantListing> {
    const res = await fetch(`${basePath}/api/mock/me/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return json<MerchantListing>(res);
  },
  async getMyListings(): Promise<MerchantListing[]> {
    const res = await fetch(`${basePath}/api/mock/me/listings`, {
      cache: 'no-store',
    });
    return json<MerchantListing[]>(res);
  },
};
