import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import type { ConfigService } from '@nestjs/config';

function cfg(values: Record<string, string>): ConfigService {
  return {
    get: <T>(k: string, d?: T) => (values[k] as unknown as T) ?? d,
  } as unknown as ConfigService;
}

describe('TrustlessIndexerService', () => {
  const ORIGINAL_FETCH = global.fetch;
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    jest.restoreAllMocks();
  });

  it('isConfigured reflects whether key + role are set', () => {
    expect(
      new TrustlessIndexerService(
        cfg({ TLW_API_KEY: 'k', PLATFORM_ROLE_ADDRESS: 'G...' })
      ).isConfigured()
    ).toBe(true);
    expect(new TrustlessIndexerService(cfg({})).isConfigured()).toBe(false);
  });

  it('calls get-escrows-by-role with the Bearer header + role params and returns the array', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ engagementId: 'eng1' }],
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const svc = new TrustlessIndexerService(
      cfg({
        TLW_API_KEY: 'secret',
        PLATFORM_ROLE_ADDRESS: 'GPLATFORM',
        TLW_NETWORK: 'testnet',
      })
    );
    const out = await svc.getPlatformEscrows();

    expect(out).toEqual([{ engagementId: 'eng1' }]);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toContain('/helper/get-escrows-by-role');
    expect(String(calledUrl)).toContain('roleAddress=GPLATFORM');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer secret'
    );
  });

  it('throws on a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    }) as unknown as typeof fetch;
    const svc = new TrustlessIndexerService(
      cfg({ TLW_API_KEY: 'k', PLATFORM_ROLE_ADDRESS: 'G' })
    );
    await expect(svc.getPlatformEscrows()).rejects.toThrow('429');
  });
});
