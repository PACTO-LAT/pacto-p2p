import type { MerchantAdapter } from '@/lib/adapters/merchant';
import { merchantSupabaseAdapter } from '@/lib/adapters/merchant.supabase';

export const merchantAdapter: MerchantAdapter = merchantSupabaseAdapter;
