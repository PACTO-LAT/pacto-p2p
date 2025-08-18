import type { MerchantAdapter } from '@/lib/adapters/merchant';
import { merchantApiAdapter } from '@/lib/adapters/merchant.api';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === '1';

function notImplementedAdapter(): MerchantAdapter {
  const fail = () => {
    throw new Error(
      'Merchant adapter not implemented. Set NEXT_PUBLIC_USE_MOCK=1'
    );
  };
  return {
    getPublicMerchantBySlug: async () => fail(),
    getBadges: async () => fail(),
    getKpis: async () => fail(),
    getVolumeSeries: async () => fail(),
    getSpeedHistogram: async () => fail(),
    getActiveListings: async () => fail(),
    getMyMerchant: async () => fail(),
    upsertMyMerchantProfile: async () => fail(),
    createMerchantListing: async () => fail(),
    getMyListings: async () => fail(),
  } as unknown as MerchantAdapter;
}

export const merchantAdapter: MerchantAdapter = useMock
  ? merchantApiAdapter
  : notImplementedAdapter();
