import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  getSupportedAssets,
  clearSupportedAssetsCache,
  type SupportedAsset,
} from './supported-assets';

const originalEnv = process.env.NEXT_PUBLIC_SUPPORTED_ASSETS;

function setEnv(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_SUPPORTED_ASSETS;
  } else {
    process.env.NEXT_PUBLIC_SUPPORTED_ASSETS = value;
  }
}

describe('getSupportedAssets', () => {
  beforeEach(() => {
    clearSupportedAssetsCache();
  });

  afterEach(() => {
    clearSupportedAssetsCache();
    setEnv(originalEnv);
  });

  it('returns fallback when env is unset', () => {
    setEnv(undefined);
    const result = getSupportedAssets();
    expect(result).toHaveLength(3);
    expect(result.map((a) => a.symbol)).toEqual(['CRCX', 'MXNX', 'USDC']);
  });

  it('returns fallback when env is empty string', () => {
    setEnv('');
    const result = getSupportedAssets();
    expect(result).toHaveLength(3);
    expect(result.map((a) => a.symbol)).toEqual(['CRCX', 'MXNX', 'USDC']);
  });

  it('returns fallback when env is whitespace only', () => {
    setEnv('   ');
    const result = getSupportedAssets();
    expect(result).toHaveLength(3);
  });

  it('returns fallback when env is invalid JSON', () => {
    setEnv('not json {');
    const result = getSupportedAssets();
    expect(result).toHaveLength(3);
    expect(result.map((a) => a.symbol)).toEqual(['CRCX', 'MXNX', 'USDC']);
  });

  it('returns validated assets when env is valid JSON object keyed by symbol', () => {
    setEnv(
      JSON.stringify({
        CRCX: {
          name: 'Costa Rican Colón Token',
          region: 'Costa Rica',
          paymentMethods: 'SINPE',
          color: 'bg-green-500',
        },
        USDC: {
          name: 'USD Coin',
          region: 'Global',
          paymentMethods: 'Varies',
          color: 'bg-emerald-600',
        },
      })
    );
    const result = getSupportedAssets();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      symbol: 'CRCX',
      name: 'Costa Rican Colón Token',
      region: 'Costa Rica',
      paymentMethods: 'SINPE',
      color: 'bg-green-500',
    });
    expect(result[1]).toMatchObject({
      symbol: 'USDC',
      name: 'USD Coin',
      region: 'Global',
      paymentMethods: 'Varies',
      color: 'bg-emerald-600',
    });
  });

  it('returns validated assets when env is valid JSON array', () => {
    const assets: SupportedAsset[] = [
      {
        symbol: 'XYZ',
        name: 'Test Token',
        region: 'Test Region',
        paymentMethods: 'Test',
        color: 'bg-blue-500',
      },
    ];
    setEnv(JSON.stringify(assets));
    const result = getSupportedAssets();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(assets[0]);
  });

  it('skips invalid entries and returns only valid ones', () => {
    setEnv(
      JSON.stringify({
        VALID: {
          name: 'Valid',
          region: 'R',
          paymentMethods: 'P',
          color: 'bg-green-500',
        },
        INVALID: { name: 'Missing region and rest' },
        VALID2: {
          name: 'Valid 2',
          region: 'R2',
          paymentMethods: 'P2',
          color: 'bg-red-500',
        },
      })
    );
    const result = getSupportedAssets();
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.symbol)).toEqual(['VALID', 'VALID2']);
  });

  it('returns fallback when all entries are invalid', () => {
    setEnv(
      JSON.stringify({
        A: {},
        B: { name: 'Only name' },
      })
    );
    const result = getSupportedAssets();
    expect(result).toHaveLength(3);
    expect(result.map((a) => a.symbol)).toEqual(['CRCX', 'MXNX', 'USDC']);
  });

  it('skips entries with empty symbol', () => {
    setEnv(
      JSON.stringify({
        '': {
          name: 'Empty Symbol',
          region: 'R',
          paymentMethods: 'P',
          color: 'bg-green-500',
        },
        OK: {
          name: 'OK',
          region: 'R',
          paymentMethods: 'P',
          color: 'bg-green-500',
        },
      })
    );
    const result = getSupportedAssets();
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe('OK');
  });

  it('caches result so subsequent calls return same array without re-parsing', () => {
    setEnv(
      JSON.stringify({
        CACHE: {
          name: 'Cache Test',
          region: 'R',
          paymentMethods: 'P',
          color: 'bg-green-500',
        },
      })
    );
    const first = getSupportedAssets();
    const second = getSupportedAssets();
    expect(first).toBe(second);
    expect(first).toHaveLength(1);
  });
});
