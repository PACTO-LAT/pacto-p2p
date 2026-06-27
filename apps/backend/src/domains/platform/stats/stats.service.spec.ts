import { ReputationService } from '@domains/platform/reputation/reputation.service';
import { StatsService } from '@domains/platform/stats/stats.service';
import type { ConfigService } from '@nestjs/config';

// Minimal chainable Supabase mock: trades select returns a fixed set; updates are recorded.
function makeSupabase(trades: any[], merchantRow: any | null) {
  const updates: Array<{ table: string; payload: any }> = [];
  const client = {
    from(table: string) {
      const builder: any = {
        _table: table,
        _payload: null as any,
        select() {
          return builder;
        },
        or() {
          return builder;
        },
        eq() {
          return builder;
        },
        maybeSingle() {
          if (table === 'merchants')
            return Promise.resolve({ data: merchantRow, error: null });
          return Promise.resolve({ data: null, error: null });
        },
        update(payload: any) {
          builder._payload = payload;
          return builder;
        },
        // biome-ignore lint/suspicious/noThenProperty: intentional thenable to mimic the chainable Supabase query builder
        then(resolve: any) {
          // SELECT trades resolves to the trade list; UPDATE resolves ok and is recorded
          if (builder._payload) {
            updates.push({ table, payload: builder._payload });
            return Promise.resolve({ data: null, error: null }).then(resolve);
          }
          if (table === 'trades')
            return Promise.resolve({ data: trades, error: null }).then(resolve);
          return Promise.resolve({ data: null, error: null }).then(resolve);
        },
      };
      return builder;
    },
  };
  return { service: { client } as any, updates };
}

const cfg = { get: <T>(_k: string, d?: T) => d } as unknown as ConfigService;
const reputation = new ReputationService(cfg);

describe('StatsService.recomputeForUser', () => {
  const completed = (n: number) =>
    Array.from({ length: n }, () => ({
      status: 'completed',
      fiat_amount: 100,
      completed_at: '2026-06-25T00:00:00Z',
      buyer_id: 'other',
      seller_id: 'u1',
    }));

  it('persists user stats derived from trades', async () => {
    const { service, updates } = makeSupabase(completed(3), null);
    const stats = new StatsService(service, reputation);
    await stats.recomputeForUser('u1');
    const userUpdate = updates.find((u) => u.table === 'users');
    expect(userUpdate?.payload.total_trades).toBe(3);
    expect(Number(userUpdate?.payload.total_volume)).toBeCloseTo(300, 5);
    expect(userUpdate?.payload.reputation_score).toBeGreaterThan(0);
  });

  it('is idempotent: two recomputes write identical payloads', async () => {
    const a = makeSupabase(completed(5), { id: 'm1', user_id: 'u1' });
    const b = makeSupabase(completed(5), { id: 'm1', user_id: 'u1' });
    await new StatsService(a.service, reputation).recomputeForUser('u1');
    await new StatsService(b.service, reputation).recomputeForUser('u1');
    const strip = (us: typeof a.updates) =>
      us.map(({ table, payload: { updated_at: _updated_at, ...rest } }) => ({
        table,
        payload: rest,
      }));
    expect(strip(a.updates)).toEqual(strip(b.updates));
  });
});
