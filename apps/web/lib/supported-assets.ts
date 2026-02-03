export interface SupportedAsset {
  symbol: string;
  name: string;
  region: string;
  paymentMethods: string;
  color: string;
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

const SUPPORTED_ASSET_MAP = new Map(
  DEFAULT_SUPPORTED_ASSETS.map((asset) => [asset.symbol, asset])
);

const REQUIRED_FIELDS: Array<keyof Omit<SupportedAsset, 'symbol'>> = [
  'name',
  'region',
  'paymentMethods',
  'color',
];

const LOG_PREFIX = '[supported-assets]';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

const parseFromCsv = (raw: string): SupportedAsset[] => {
  const symbols = raw
    .split(',')
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);

  const invalidSymbols: string[] = [];
  const results: SupportedAsset[] = [];
  const seen = new Set<string>();

  for (const symbol of symbols) {
    if (seen.has(symbol)) {
      continue;
    }
    seen.add(symbol);
    const asset = SUPPORTED_ASSET_MAP.get(symbol);
    if (!asset) {
      invalidSymbols.push(symbol);
      continue;
    }
    results.push(asset);
  }

  if (invalidSymbols.length > 0) {
    console.warn(
      `${LOG_PREFIX} Unsupported asset symbols in NEXT_PUBLIC_SUPPORTED_ASSETS: ${invalidSymbols.join(
        ', '
      )}`
    );
  }

  return results;
};

const parseFromJsonRecord = (record: Record<string, unknown>) => {
  const invalidSymbols: string[] = [];
  const invalidFields: string[] = [];
  const results: SupportedAsset[] = [];

  for (const [rawSymbol, rawMetadata] of Object.entries(record)) {
    const symbol = normalizeSymbol(rawSymbol);
    if (!symbol) {
      invalidSymbols.push(rawSymbol);
      continue;
    }

    if (!SUPPORTED_ASSET_MAP.has(symbol)) {
      invalidSymbols.push(symbol);
      continue;
    }

    if (!rawMetadata || typeof rawMetadata !== 'object') {
      invalidFields.push(symbol);
      continue;
    }

    const metadata = rawMetadata as Record<string, unknown>;
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !isNonEmptyString(metadata[field])
    );

    if (missingFields.length > 0) {
      invalidFields.push(`${symbol} (${missingFields.join(', ')})`);
      continue;
    }

    results.push({
      symbol,
      name: (metadata.name as string).trim(),
      region: (metadata.region as string).trim(),
      paymentMethods: (metadata.paymentMethods as string).trim(),
      color: (metadata.color as string).trim(),
    });
  }

  if (invalidSymbols.length > 0) {
    console.warn(
      `${LOG_PREFIX} Unsupported asset symbols in NEXT_PUBLIC_SUPPORTED_ASSETS: ${invalidSymbols.join(
        ', '
      )}`
    );
  }

  if (invalidFields.length > 0) {
    console.warn(
      `${LOG_PREFIX} Assets missing required fields in NEXT_PUBLIC_SUPPORTED_ASSETS: ${invalidFields.join(
        ', '
      )}`
    );
  }

  return results;
};

const parseFromJsonArray = (rawArray: unknown[]) => {
  const results: SupportedAsset[] = [];
  const invalidSymbols: string[] = [];
  const invalidFields: string[] = [];
  const seen = new Set<string>();

  for (const entry of rawArray) {
    if (isNonEmptyString(entry)) {
      const symbol = normalizeSymbol(entry);
      if (!SUPPORTED_ASSET_MAP.has(symbol)) {
        invalidSymbols.push(symbol);
        continue;
      }
      if (!seen.has(symbol)) {
        results.push(SUPPORTED_ASSET_MAP.get(symbol)!);
        seen.add(symbol);
      }
      continue;
    }

    if (!entry || typeof entry !== 'object') {
      invalidFields.push(String(entry));
      continue;
    }

    const metadata = entry as Record<string, unknown>;
    if (!isNonEmptyString(metadata.symbol)) {
      invalidFields.push('missing symbol');
      continue;
    }

    const symbol = normalizeSymbol(metadata.symbol);
    if (!SUPPORTED_ASSET_MAP.has(symbol)) {
      invalidSymbols.push(symbol);
      continue;
    }

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !isNonEmptyString(metadata[field])
    );
    if (missingFields.length > 0) {
      invalidFields.push(`${symbol} (${missingFields.join(', ')})`);
      continue;
    }

    if (!seen.has(symbol)) {
      results.push({
        symbol,
        name: (metadata.name as string).trim(),
        region: (metadata.region as string).trim(),
        paymentMethods: (metadata.paymentMethods as string).trim(),
        color: (metadata.color as string).trim(),
      });
      seen.add(symbol);
    }
  }

  if (invalidSymbols.length > 0) {
    console.warn(
      `${LOG_PREFIX} Unsupported asset symbols in NEXT_PUBLIC_SUPPORTED_ASSETS: ${invalidSymbols.join(
        ', '
      )}`
    );
  }

  if (invalidFields.length > 0) {
    console.warn(
      `${LOG_PREFIX} Invalid asset entries in NEXT_PUBLIC_SUPPORTED_ASSETS: ${invalidFields.join(
        ', '
      )}`
    );
  }

  return results;
};

export const parseSupportedAssets = (
  raw: string | undefined
): SupportedAsset[] => {
  if (!raw || raw.trim().length === 0) {
    return DEFAULT_SUPPORTED_ASSETS;
  }

  const trimmed = raw.trim();
  let parsedAssets: SupportedAsset[] = [];

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        parsedAssets = parseFromJsonArray(parsed);
      } else if (parsed && typeof parsed === 'object') {
        parsedAssets = parseFromJsonRecord(parsed as Record<string, unknown>);
      } else {
        console.warn(
          `${LOG_PREFIX} Expected JSON object or array in NEXT_PUBLIC_SUPPORTED_ASSETS.`
        );
      }
    } catch (error) {
      console.error(
        `${LOG_PREFIX} Failed to parse NEXT_PUBLIC_SUPPORTED_ASSETS JSON.`,
        error
      );
    }
  } else {
    parsedAssets = parseFromCsv(trimmed);
  }

  if (parsedAssets.length === 0) {
    console.warn(
      `${LOG_PREFIX} Falling back to default supported assets.`
    );
    return DEFAULT_SUPPORTED_ASSETS;
  }

  return parsedAssets;
};

let cachedAssets: SupportedAsset[] | null = null;

export const getSupportedAssets = (): SupportedAsset[] => {
  if (!cachedAssets) {
    cachedAssets = parseSupportedAssets(
      process.env.NEXT_PUBLIC_SUPPORTED_ASSETS
    );
  }
  return cachedAssets;
};

export const DEFAULT_SUPPORTED_ASSET_SYMBOLS = [
  ...SUPPORTED_ASSET_MAP.keys(),
];
