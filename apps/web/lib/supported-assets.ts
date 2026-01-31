/**
 * Supported asset metadata for the landing Assets Section.
 * Sourced from NEXT_PUBLIC_SUPPORTED_ASSETS with fallback to defaults.
 */

export interface SupportedAsset {
  symbol: string;
  name: string;
  region: string;
  paymentMethods: string;
  color: string;
}

const REQUIRED_KEYS: (keyof SupportedAsset)[] = [
  'symbol',
  'name',
  'region',
  'paymentMethods',
  'color',
];

function isSupportedAsset(value: unknown): value is SupportedAsset {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (typeof obj[key] !== 'string') return false;
  }
  return typeof obj.symbol === 'string' && obj.symbol.trim().length > 0;
}

const DEFAULT_SUPPORTED_ASSETS: SupportedAsset[] = [
  {
    symbol: 'CRCX',
    name: 'Costa Rican Colón Token',
    region: 'Costa Rica',
    paymentMethods: 'SINPE',
    color: 'bg-green-500',
  },
  {
    symbol: 'MXNX',
    name: 'Mexican Peso Token',
    region: 'Mexico',
    paymentMethods: 'SPEI, OXXO (coming)',
    color: 'bg-red-500',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    region: 'Global',
    paymentMethods: 'Varies',
    color: 'bg-emerald-600',
  },
];

let cachedAssets: SupportedAsset[] | null = null;

/**
 * Clears the cached assets (for testing only). Call before tests that change env.
 */
export function clearSupportedAssetsCache(): void {
  cachedAssets = null;
}

/**
 * Parses NEXT_PUBLIC_SUPPORTED_ASSETS and returns validated assets.
 * Falls back to default assets when env is unset, empty, invalid JSON, or has no valid entries.
 * Result is cached per process.
 */
export function getSupportedAssets(): SupportedAsset[] {
  if (cachedAssets !== null) return cachedAssets;

  const raw = process.env.NEXT_PUBLIC_SUPPORTED_ASSETS;
  if (raw === undefined || raw.trim() === '') {
    cachedAssets = DEFAULT_SUPPORTED_ASSETS;
    return cachedAssets;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    cachedAssets = DEFAULT_SUPPORTED_ASSETS;
    return cachedAssets;
  }

  const validated: SupportedAsset[] = [];

  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const entries = Object.entries(parsed as Record<string, unknown>);
    for (const [symbol, value] of entries) {
      const withSymbol =
        value !== null && typeof value === 'object'
          ? { symbol: symbol.trim(), ...(value as Record<string, unknown>) }
          : { symbol: symbol.trim() };
      if (isSupportedAsset(withSymbol)) {
        validated.push(withSymbol);
      } else {
        console.warn(
          `[supported-assets] Skipping invalid asset entry: symbol="${symbol}"`
        );
      }
    }
  } else if (Array.isArray(parsed)) {
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (isSupportedAsset(item)) {
        validated.push(item);
      } else {
        console.warn(
          `[supported-assets] Skipping invalid asset at index ${i}:`,
          item
        );
      }
    }
  }

  if (validated.length === 0) {
    cachedAssets = DEFAULT_SUPPORTED_ASSETS;
    return cachedAssets;
  }

  cachedAssets = validated;
  return cachedAssets;
}
