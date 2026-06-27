// biome-ignore lint/suspicious/noExplicitAny: test mock
import type { SupabaseService } from '@core/supabase/supabase.service';
import type { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';

function makeSupabase() {
  const updates: Array<{ match: string; payload: any }> = [];
  const client = {
    from() {
      const b: any = {
        _payload: null,
        update(p: any) {
          b._payload = p;
          return b;
        },
        eq(_col: string, val: string) {
          if (b._payload) updates.push({ match: val, payload: b._payload });
          return Promise.resolve({ data: null, error: null });
        },
      };
      return b;
    },
  };
  return { service: { client } as unknown as SupabaseService, updates };
}

describe('EscrowIndexerService.indexAll', () => {
  const indexer = (escrows: any[]) =>
    ({
      isConfigured: () => true,
      getPlatformEscrows: jest.fn().mockResolvedValue(escrows),
    }) as unknown as TrustlessIndexerService;

  it('updates each escrow row with the mapped patch (matched by engagement_id)', async () => {
    const { service, updates } = makeSupabase();
    const svc = new EscrowIndexerService(
      service,
      indexer([{ engagementId: 'eng1', amount: 100, balance: 100, flags: {} }])
    );
    const res = await svc.indexAll();
    expect(res.indexed).toBe(1);
    expect(updates[0].match).toBe('eng1');
    expect(updates[0].payload.on_chain_status).toBe('funded');
    expect(updates[0].payload.balance).toBe(100);
  });

  it('no-ops when TLW is not configured', async () => {
    const { service } = makeSupabase();
    const notConfigured = {
      isConfigured: () => false,
      getPlatformEscrows: jest.fn(),
    } as unknown as TrustlessIndexerService;
    const res = await new EscrowIndexerService(
      service,
      notConfigured
    ).indexAll();
    expect(res.indexed).toBe(0);
  });
});
