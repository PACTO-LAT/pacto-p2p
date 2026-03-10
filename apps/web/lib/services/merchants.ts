import { merchantAdapter } from '@/lib/adapters';
import type { Merchant } from '@/lib/types/merchant';

export type MerchantApplicationFormData = {
  display_name: string;
  bio?: string;
  location?: string;
  languages?: string[];
  socials?: Merchant['socials'];
  is_public?: boolean;
};

/**
 * Submits a merchant application. Creates a new merchants row with
 * verification_status = 'pending', or re-opens a rejected/revoked application.
 * Uses the current authenticated user's session.
 */
export async function applyAsMerchant(
  formData: MerchantApplicationFormData
): Promise<Merchant> {
  return merchantAdapter.upsertMyMerchantProfile({
    display_name: formData.display_name,
    bio: formData.bio,
    location: formData.location,
    languages: formData.languages,
    socials: formData.socials,
    is_public: formData.is_public ?? false,
  });
}
