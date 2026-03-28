import { TRUSTLINES } from './constants/trustlines';

export const getTrustline = (token: string) => {
  const trustline = TRUSTLINES.find((t) => t.name === token);

  return trustline;
};

export const getTrustlineName = (token: string) => {
  const trustline = TRUSTLINES.find((t) => t.address === token);

  if (!trustline) {
    return 'Unknown Token';
  }
  return trustline.name;
};

/**
 * Returns the public URL of a token logo stored in the token-logos bucket.
 * Falls back to null if the Supabase URL is not configured.
 * Upload images as: token-logos/{SYMBOL}.png  (e.g. token-logos/USDC.png)
 */
export const getTokenLogoUrl = (symbol: string): string | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/token-logos/${symbol.toUpperCase()}.png`;
};
