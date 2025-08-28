import type { MerchantAdapter } from '@/lib/adapters/merchant';
import { merchantApiAdapter } from '@/lib/adapters/merchant.api';
import { merchantSupabaseAdapter } from '@/lib/adapters/merchant.supabase';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === '1';

export const merchantAdapter: MerchantAdapter = useMock
  ? merchantApiAdapter
  : merchantSupabaseAdapter;
