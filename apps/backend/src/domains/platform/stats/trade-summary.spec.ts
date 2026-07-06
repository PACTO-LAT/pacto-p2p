import {
  summarizeTrades,
  type TradeRow,
} from '@domains/platform/stats/trade-summary';

const NOW = Date.parse('2026-06-26T00:00:00Z');
const day = 86_400_000;

function t(partial: Partial<TradeRow>): TradeRow {
  return {
    status: 'completed',
    fiat_amount: 100,
    fiat_amount_usd: null,
    fiat_currency: 'USD',
    completed_at: new Date(NOW - day).toISOString(),
    buyer_id: 'b',
    seller_id: 's',
    ...partial,
  };
}

describe('summarizeTrades', () => {
  it('counts by status and sums completed volume', () => {
    const s = summarizeTrades(
      [
        t({ status: 'completed', fiat_amount: 100 }),
        t({ status: 'completed', fiat_amount: 50 }),
        t({ status: 'disputed', fiat_amount: 70 }),
        t({ status: 'resolved', fiat_amount: 70 }),
        t({ status: 'cancelled', fiat_amount: 10 }),
        t({ status: 'failed', fiat_amount: 10 }),
        t({ status: 'pending', fiat_amount: 999 }),
      ],
      NOW
    );
    expect(s.completed).toBe(2);
    expect(s.disputed).toBe(2); // disputed + resolved
    expect(s.cancelledFailed).toBe(2);
    expect(s.volume).toBeCloseTo(150, 5); // only completed
  });

  it('excludes self-trades and zero/negative amounts', () => {
    const s = summarizeTrades(
      [
        t({
          status: 'completed',
          buyer_id: 'x',
          seller_id: 'x',
          fiat_amount: 100,
        }),
        t({ status: 'completed', fiat_amount: 0 }),
        t({ status: 'completed', fiat_amount: 200 }),
      ],
      NOW
    );
    expect(s.completed).toBe(1);
    expect(s.volume).toBeCloseTo(200, 5);
  });

  it('reports days since the most recent completed trade', () => {
    const s = summarizeTrades(
      [
        t({
          status: 'completed',
          completed_at: new Date(NOW - 5 * day).toISOString(),
        }),
        t({
          status: 'completed',
          completed_at: new Date(NOW - 2 * day).toISOString(),
        }),
      ],
      NOW
    );
    expect(s.daysSinceLastCompleted).toBeCloseTo(2, 5);
  });

  it('returns null recency when there are no completed trades', () => {
    const s = summarizeTrades([t({ status: 'disputed' })], NOW);
    expect(s.daysSinceLastCompleted).toBeNull();
  });

  it('is deterministic / idempotent for the same input', () => {
    const input = [
      t({ status: 'completed', fiat_amount: 100 }),
      t({ status: 'disputed' }),
    ];
    expect(summarizeTrades(input, NOW)).toEqual(summarizeTrades(input, NOW));
  });

  it('sums mixed-currency volume in USD', () => {
    const s = summarizeTrades(
      [
        t({
          status: 'completed',
          fiat_amount: 100_000,
          fiat_amount_usd: 196,
          fiat_currency: 'CRC',
        }),
        t({
          status: 'completed',
          fiat_amount: 1000,
          fiat_amount_usd: 53.5,
          fiat_currency: 'MXN',
        }),
        t({
          status: 'completed',
          fiat_amount: 100,
          fiat_amount_usd: null,
          fiat_currency: 'USD',
        }),
      ],
      NOW
    );
    expect(s.completed).toBe(3);
    expect(s.volume).toBeCloseTo(349.5, 5);
  });
});
