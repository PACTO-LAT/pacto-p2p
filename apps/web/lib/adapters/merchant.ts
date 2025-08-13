import type {
  Merchant,
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';

export interface MerchantAdapter {
  listPublicMerchants(): Promise<Merchant[]>;
  getPublicMerchantBySlug(slug: string): Promise<Merchant | null>;
  getBadges(merchantId: string): Promise<MerchantBadge[]>;
  getKpis(merchantId: string): Promise<MerchantKpis>;
  getVolumeSeries(merchantId: string): Promise<VolumePoint[]>;
  getSpeedHistogram(merchantId: string): Promise<SpeedBucket[]>;
  getActiveListings(merchantId: string): Promise<MerchantListing[]>;

  // Auth’d views (simulate logged-in)
  getMyMerchant(): Promise<Merchant | null>;
  upsertMyMerchantProfile(input: {
    display_name: string;
    bio?: string;
    location?: string;
    languages?: string[];
    socials?: Merchant['socials'];
    is_public?: boolean;
    avatar_url?: string;
    banner_url?: string;
    slug?: string;
  }): Promise<Merchant>;
  createMerchantListing(
    payload: Omit<MerchantListing, 'id' | 'status' | 'created_at'>
  ): Promise<MerchantListing>;
  getMyListings(): Promise<MerchantListing[]>;
}
