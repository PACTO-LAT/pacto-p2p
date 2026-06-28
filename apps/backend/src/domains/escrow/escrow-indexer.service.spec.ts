import type { SupabaseService } from '@core/supabase/supabase.service';
import type { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import type { NotificationsService } from '@domains/notifications/notifications.service';

// Mock: notifications row read via select().eq().maybeSingle(); escrow update via update().eq().
function makeSupabase(existing: any | null) {
  const updates: Array<{ match: string; payload: any }> = [];
  const client = {
    from(_table: string) {
      const b: any = {
        _payload: null as any,
        select() {
          return b;
        },
        update(p: any) {
          b._payload = p;
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: existing, error: null });
        },
        eq(_col: string, val: string) {
          if (b._payload) {
            updates.push({ match: val, payload: b._payload });
            return Promise.resolve({ data: null, error: null });
          }
          return b;
        },
      };
      return b;
    },
  };
  return { service: { client } as unknown as SupabaseService, updates };
}

const indexerWith = (escrows: any[]) =>
  ({
    isConfigured: () => true,
    getPlatformEscrows: jest.fn().mockResolvedValue(escrows),
  }) as unknown as TrustlessIndexerService;

const notifySpy = () => {
  const onEscrowReleased = jest.fn().mockResolvedValue(undefined);
  return {
    svc: { onEscrowReleased } as unknown as NotificationsService,
    onEscrowReleased,
  };
};

describe('EscrowIndexerService.indexAll', () => {
  it('updates the matched escrow row with the mapped patch', async () => {
    const { service, updates } = makeSupabase({
      id: 'esc-1',
      on_chain_status: 'active',
      buyer_id: 'b',
      seller_id: 's',
    });
    const { svc } = notifySpy();
    const res = await new EscrowIndexerService(
      service,
      indexerWith([
        { engagementId: 'eng1', amount: 100, balance: 100, flags: {} },
      ]),
      svc
    ).indexAll();
    expect(res.indexed).toBe(1);
    expect(updates[0].match).toBe('eng1');
    expect(updates[0].payload.on_chain_status).toBe('funded');
  });

  it('notifies once on a funded → released transition, before writing status', async () => {
    const { service } = makeSupabase({
      id: 'esc-1',
      on_chain_status: 'funded',
      buyer_id: 'b',
      seller_id: 's',
    });
    const { svc, onEscrowReleased } = notifySpy();
    await new EscrowIndexerService(
      service,
      indexerWith([
        {
          engagementId: 'eng1',
          amount: 100,
          balance: 100,
          flags: { released: true },
        },
      ]),
      svc
    ).indexAll();
    expect(onEscrowReleased).toHaveBeenCalledTimes(1);
    expect(onEscrowReleased).toHaveBeenCalledWith({
      escrowId: 'esc-1',
      buyerId: 'b',
      sellerId: 's',
      engagementId: 'eng1',
      amount: 100,
    });
  });

  it('does NOT notify when already released (idempotent) or on baseline (no prior row)', async () => {
    const already = makeSupabase({
      id: 'esc-1',
      on_chain_status: 'released',
      buyer_id: 'b',
      seller_id: 's',
    });
    const n1 = notifySpy();
    await new EscrowIndexerService(
      already.service,
      indexerWith([
        {
          engagementId: 'eng1',
          amount: 1,
          balance: 1,
          flags: { released: true },
        },
      ]),
      n1.svc
    ).indexAll();
    expect(n1.onEscrowReleased).not.toHaveBeenCalled();

    const missing = makeSupabase(null);
    const n2 = notifySpy();
    const res = await new EscrowIndexerService(
      missing.service,
      indexerWith([
        {
          engagementId: 'eng1',
          amount: 1,
          balance: 1,
          flags: { released: true },
        },
      ]),
      n2.svc
    ).indexAll();
    expect(n2.onEscrowReleased).not.toHaveBeenCalled();
    expect(res.unmatched).toBe(1);
  });

  it('no-ops when TLW is not configured', async () => {
    const { service } = makeSupabase(null);
    const { svc } = notifySpy();
    const notConfigured = {
      isConfigured: () => false,
      getPlatformEscrows: jest.fn(),
    } as unknown as TrustlessIndexerService;
    const res = await new EscrowIndexerService(
      service,
      notConfigured,
      svc
    ).indexAll();
    expect(res.indexed).toBe(0);
  });
});
