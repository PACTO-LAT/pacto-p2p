import { ReputationService } from '@domains/platform/reputation/reputation.service';
import type { ConfigService } from '@nestjs/config';

// ConfigService stub: always returns the provided default → engine uses default weights
const cfg = { get: <T>(_k: string, d?: T) => d } as unknown as ConfigService;
const svc = new ReputationService(cfg);

describe('ReputationService', () => {
  it('returns the neutral score (~3.0) for an entity with no trades', () => {
    const s = svc.score({
      completed: 0,
      disputed: 0,
      cancelledFailed: 0,
      volume: 0,
      daysSinceLastCompleted: null,
    });
    expect(s).toBeCloseTo(3.0, 1);
  });

  it('is high for many completed trades with no disputes', () => {
    const s = svc.score({
      completed: 100,
      disputed: 0,
      cancelledFailed: 0,
      volume: 5000,
      daysSinceLastCompleted: 1,
    });
    expect(s).toBeGreaterThan(4.5);
  });

  it('is low when dispute rate is high', () => {
    const s = svc.score({
      completed: 10,
      disputed: 10,
      cancelledFailed: 0,
      volume: 1000,
      daysSinceLastCompleted: 1,
    });
    expect(s).toBeLessThan(2.0);
  });

  it('shrinks toward neutral with very few samples (one perfect trade is not 5★)', () => {
    const s = svc.score({
      completed: 1,
      disputed: 0,
      cancelledFailed: 0,
      volume: 100,
      daysSinceLastCompleted: 1,
    });
    expect(s).toBeLessThan(3.6);
  });

  it('applies decay after long inactivity', () => {
    const active = svc.score({
      completed: 100,
      disputed: 0,
      cancelledFailed: 0,
      volume: 5000,
      daysSinceLastCompleted: 1,
    });
    const stale = svc.score({
      completed: 100,
      disputed: 0,
      cancelledFailed: 0,
      volume: 5000,
      daysSinceLastCompleted: 200,
    });
    expect(stale).toBeLessThan(active);
  });

  it('caps the volume bonus (huge volume cannot dominate)', () => {
    const low = svc.score({
      completed: 50,
      disputed: 0,
      cancelledFailed: 0,
      volume: 1,
      daysSinceLastCompleted: 1,
    });
    const huge = svc.score({
      completed: 50,
      disputed: 0,
      cancelledFailed: 0,
      volume: 1e9,
      daysSinceLastCompleted: 1,
    });
    expect(huge - low).toBeLessThanOrEqual(0.3); // ≤ volumeWeight(0.05)*5 + rounding
  });

  it('computes completion/dispute rates as percentages', () => {
    const r = svc.rates({
      completed: 8,
      disputed: 2,
      cancelledFailed: 0,
      volume: 0,
      daysSinceLastCompleted: null,
    });
    expect(r.completionRate).toBeCloseTo(80, 5);
    expect(r.disputeRate).toBeCloseTo(20, 5);
  });
});
