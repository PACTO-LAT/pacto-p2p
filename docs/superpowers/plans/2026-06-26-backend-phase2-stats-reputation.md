# Backend Phase 2 — Stats + Reputation + Read API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `apps/backend` compute, persist, and serve merchant/user stats + reputation from `trades`, and switch the web profile/merchant pages to read the core numbers from the backend API.

**Architecture:** New `domains/platform` bounded context with a pure `ReputationService` (configurable 0–5 engine) and a `StatsService` that recomputes each entity **from source** (idempotent) and persists to `users.*` / `merchants.*`. A versioned read API + internal recompute endpoints (behind the existing `InternalApiKeyGuard`). The web triggers a best-effort recompute after trade completion/dispute and reads core stats through server-side proxies.

**Tech Stack:** NestJS 11, `@supabase/supabase-js` (service role), `@nestjs/config` (Joi), Jest + ts-jest (new, backend only), Next.js (web), Supabase migration.

**Spec:** `docs/superpowers/specs/2026-06-26-backend-phase2-stats-reputation-design.md`
**Branch:** `feat/136-stats-reputation` (already created from `develop`).
**Build hygiene:** before any backend build run `rm -rf apps/backend/dist apps/backend/*.tsbuildinfo` (stale incremental `.tsbuildinfo` suppresses emit). Run the backend from `apps/backend` (dotenv uses cwd): `cd apps/backend && node dist/main.js`, or `npm run dev:backend` from root.
**DI footgun:** Biome's `useImportType` autofix converts injected/decorated imports to `import type`, which breaks NestJS DI under `emitDecoratorMetadata`. Keep injected deps (`ConfigService`, `SupabaseService`, `ReputationService`, etc.) as VALUE imports; add `// biome-ignore lint/style/useImportType: required for NestJS dependency injection` if Biome flags them. Type-only imports (DTO interfaces, `Request`) stay `import type`.

---

## File map

| File | Responsibility |
|---|---|
| `apps/backend/jest.config.js`, `package.json` (mod) | Jest + ts-jest setup; `test` script |
| `apps/backend/src/domains/platform/reputation/reputation.service.ts` | Pure 0–5 scoring engine + rate helper (config-driven weights) |
| `apps/backend/src/domains/platform/reputation/reputation.service.spec.ts` | Engine unit tests |
| `apps/backend/src/domains/platform/reputation/reputation.module.ts` | Provides/exports ReputationService |
| `apps/backend/src/config/env.validation.ts` (mod), `.env.example` (mod) | `REPUTATION_*` env (optional, defaulted) |
| `supabase/migrations/20260627000000_add_merchant_rate_columns.sql` | `merchants.completion_rate`, `merchants.dispute_rate` |
| `apps/backend/src/domains/platform/stats/trade-summary.ts` | Pure `summarizeTrades(trades, now)` → counts/volume/recency |
| `apps/backend/src/domains/platform/stats/trade-summary.spec.ts` | Summary + idempotency (determinism) tests |
| `apps/backend/src/domains/platform/stats/stats.service.ts` | Recompute (fetch → summarize → score → persist) |
| `apps/backend/src/domains/platform/stats/dto/recompute.dto.ts` | `{ userIds: string[] }` request DTO |
| `apps/backend/src/domains/platform/stats/stats.controller.ts` | Read API + internal recompute endpoints |
| `apps/backend/src/domains/platform/stats/stats.module.ts`, `platform.module.ts` | Wiring |
| `apps/backend/src/app.module.ts` (mod) | Import `PlatformModule` |
| `apps/web/lib/services/backend.ts` | Server-only `backendFetch` helper |
| `apps/web/lib/api/require-user.ts` | Resolve current user in a route (mirror `requireAdmin`) |
| `apps/web/app/api/stats/me/route.ts` | GET proxy → `/v1/users/:id/stats` |
| `apps/web/app/api/stats/recompute/route.ts` | POST proxy → `/v1/internal/stats/recompute` |
| `apps/web/hooks/use-user-stats.ts`, `components/profile/ProfileStats.tsx` (mod) | Consume `/api/stats/me` |
| `apps/web/app/m/[slug]/page.tsx` (mod), `lib/adapters/merchant.supabase.ts` (mod) | Merchant page reads backend; align filters to seller-only |
| `apps/web/hooks/use-trades.ts` (mod) | Fire recompute after completion/dispute |

---

## Task 1: Jest setup for the backend

**Files:**
- Modify: `apps/backend/package.json`
- Create: `apps/backend/jest.config.js`, `apps/backend/src/sanity.spec.ts` (temporary)

- [ ] **Step 1: Add Jest deps + `test` script to `apps/backend/package.json`**

Add to `devDependencies`: `"jest": "^29.7.0"`, `"ts-jest": "^29.2.0"`, `"@types/jest": "^29.5.12"`. Add to `scripts`: `"test": "jest"`.

- [ ] **Step 2: Create `apps/backend/jest.config.js`**

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@domains/(.*)$': '<rootDir>/domains/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true } }],
  },
};
```

- [ ] **Step 3: Create a temporary `apps/backend/src/sanity.spec.ts`**

```ts
describe('jest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Install + run**

Run: `npm install` (root) then `cd apps/backend && npm test`
Expected: jest runs, 1 passing test.

- [ ] **Step 5: Confirm Biome ignores spec output and exclude tests from the build**

`tsconfig.build.json` already excludes `**/*.spec.ts`. Verify `cd apps/backend && rm -rf dist *.tsbuildinfo && npm run build` still succeeds (specs not emitted).

- [ ] **Step 6: Delete the temporary sanity spec and commit**

```bash
rm apps/backend/src/sanity.spec.ts
git add apps/backend/package.json apps/backend/jest.config.js package-lock.json
git commit -m "test(backend): add Jest + ts-jest setup (#136)"
```

---

## Task 2: Reputation engine (config-driven, pure) — TDD

**Files:**
- Create: `apps/backend/src/domains/platform/reputation/reputation.service.ts`, `reputation.service.spec.ts`, `reputation.module.ts`
- Modify: `apps/backend/src/config/env.validation.ts`, `apps/backend/.env.example`

- [ ] **Step 1: Write the failing test `reputation.service.spec.ts`**

```ts
import { ConfigService } from '@nestjs/config';
import { ReputationService } from '@domains/platform/reputation/reputation.service';

// ConfigService stub: always returns the provided default → engine uses default weights
const cfg = { get: <T>(_k: string, d?: T) => d } as unknown as ConfigService;
const svc = new ReputationService(cfg);

describe('ReputationService', () => {
  it('returns the neutral score (~3.0) for an entity with no trades', () => {
    const s = svc.score({ completed: 0, disputed: 0, cancelledFailed: 0, volume: 0, daysSinceLastCompleted: null });
    expect(s).toBeCloseTo(3.0, 1);
  });

  it('is high for many completed trades with no disputes', () => {
    const s = svc.score({ completed: 100, disputed: 0, cancelledFailed: 0, volume: 5000, daysSinceLastCompleted: 1 });
    expect(s).toBeGreaterThan(4.5);
  });

  it('is low when dispute rate is high', () => {
    const s = svc.score({ completed: 10, disputed: 10, cancelledFailed: 0, volume: 1000, daysSinceLastCompleted: 1 });
    expect(s).toBeLessThan(2.0);
  });

  it('shrinks toward neutral with very few samples (one perfect trade is not 5★)', () => {
    const s = svc.score({ completed: 1, disputed: 0, cancelledFailed: 0, volume: 100, daysSinceLastCompleted: 1 });
    expect(s).toBeLessThan(3.6);
  });

  it('applies decay after long inactivity', () => {
    const active = svc.score({ completed: 100, disputed: 0, cancelledFailed: 0, volume: 5000, daysSinceLastCompleted: 1 });
    const stale = svc.score({ completed: 100, disputed: 0, cancelledFailed: 0, volume: 5000, daysSinceLastCompleted: 200 });
    expect(stale).toBeLessThan(active);
  });

  it('caps the volume bonus (huge volume cannot dominate)', () => {
    const low = svc.score({ completed: 50, disputed: 0, cancelledFailed: 0, volume: 1, daysSinceLastCompleted: 1 });
    const huge = svc.score({ completed: 50, disputed: 0, cancelledFailed: 0, volume: 1e9, daysSinceLastCompleted: 1 });
    expect(huge - low).toBeLessThanOrEqual(0.30); // ≤ volumeWeight(0.05)*5 + rounding
  });

  it('computes completion/dispute rates as percentages', () => {
    const r = svc.rates({ completed: 8, disputed: 2, cancelledFailed: 0, volume: 0, daysSinceLastCompleted: null });
    expect(r.completionRate).toBeCloseTo(80, 5);
    expect(r.disputeRate).toBeCloseTo(20, 5);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- reputation`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `reputation.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';

export interface ReputationInput {
  completed: number;
  disputed: number;
  cancelledFailed: number;
  volume: number;
  daysSinceLastCompleted: number | null;
}

interface ReputationWeights {
  wCompletion: number;
  wDispute: number;
  smoothingK: number;
  neutral: number;
  recencyDays: number;
  decay: number;
  volumeWeight: number;
  volumeSat: number;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

@Injectable()
export class ReputationService {
  private readonly w: ReputationWeights;

  constructor(config: ConfigService) {
    this.w = {
      wCompletion: config.get<number>('REPUTATION_W_COMPLETION', 1.0),
      wDispute: config.get<number>('REPUTATION_W_DISPUTE', 1.5),
      smoothingK: config.get<number>('REPUTATION_SMOOTHING_K', 8),
      neutral: config.get<number>('REPUTATION_NEUTRAL', 0.6),
      recencyDays: config.get<number>('REPUTATION_RECENCY_DAYS', 90),
      decay: config.get<number>('REPUTATION_DECAY', 0.9),
      volumeWeight: config.get<number>('REPUTATION_VOLUME_WEIGHT', 0.05),
      volumeSat: config.get<number>('REPUTATION_VOLUME_SAT', 10000),
    };
  }

  rates(input: ReputationInput): { completionRate: number; disputeRate: number } {
    const f = input.completed + input.disputed + input.cancelledFailed;
    if (f <= 0) {
      return { completionRate: 0, disputeRate: 0 };
    }
    return {
      completionRate: Math.round((input.completed / f) * 10000) / 100,
      disputeRate: Math.round((input.disputed / f) * 10000) / 100,
    };
  }

  score(input: ReputationInput): number {
    const { completed: c, disputed: d, cancelledFailed: x, volume: v } = input;
    const f = c + d + x;
    const completionRatio = f > 0 ? c / f : 0;
    const disputeRatio = f > 0 ? d / f : 0;

    const q = clamp(
      this.w.wCompletion * completionRatio - this.w.wDispute * disputeRatio,
      0,
      1
    );
    const conf = c / (c + this.w.smoothingK);
    let qAdj = conf * q + (1 - conf) * this.w.neutral;
    if (
      input.daysSinceLastCompleted !== null &&
      input.daysSinceLastCompleted > this.w.recencyDays
    ) {
      qAdj *= this.w.decay;
    }
    const vbonus =
      this.w.volumeWeight *
      Math.min(1, Math.log1p(Math.max(0, v)) / Math.log1p(this.w.volumeSat));
    const final = clamp(qAdj + vbonus, 0, 1);
    return Math.round(final * 5 * 100) / 100;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- reputation`
Expected: PASS (7 tests).

- [ ] **Step 5: Create `reputation.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ReputationService } from '@domains/platform/reputation/reputation.service';

@Module({
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
```

- [ ] **Step 6: Add `REPUTATION_*` to `apps/backend/src/config/env.validation.ts`**

Inside the `Joi.object({ ... })`, add (all optional with defaults):

```ts
  REPUTATION_W_COMPLETION: Joi.number().default(1.0),
  REPUTATION_W_DISPUTE: Joi.number().default(1.5),
  REPUTATION_SMOOTHING_K: Joi.number().default(8),
  REPUTATION_NEUTRAL: Joi.number().min(0).max(1).default(0.6),
  REPUTATION_RECENCY_DAYS: Joi.number().default(90),
  REPUTATION_DECAY: Joi.number().min(0).max(1).default(0.9),
  REPUTATION_VOLUME_WEIGHT: Joi.number().min(0).max(1).default(0.05),
  REPUTATION_VOLUME_SAT: Joi.number().positive().default(10000),
```

- [ ] **Step 7: Document them in `apps/backend/.env.example`**

Append:

```dotenv

# Reputation model (optional — all have sane defaults)
REPUTATION_W_COMPLETION=1.0
REPUTATION_W_DISPUTE=1.5
REPUTATION_SMOOTHING_K=8
REPUTATION_NEUTRAL=0.6
REPUTATION_RECENCY_DAYS=90
REPUTATION_DECAY=0.9
REPUTATION_VOLUME_WEIGHT=0.05
REPUTATION_VOLUME_SAT=10000
```

- [ ] **Step 8: Biome + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
git add apps/backend/src/domains/platform/reputation apps/backend/src/config/env.validation.ts apps/backend/.env.example
git commit -m "feat(backend): add configurable reputation engine + tests (#136)"
```

---

## Task 3: DB migration — merchant rate columns

**Files:**
- Create: `supabase/migrations/20260627000000_add_merchant_rate_columns.sql`

- [ ] **Step 1: Create the migration**

```sql
-- Add persisted completion/dispute rate columns to merchants (percent 0-100).
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (completion_rate >= 0 AND completion_rate <= 100),
  ADD COLUMN IF NOT EXISTS dispute_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (dispute_rate >= 0 AND dispute_rate <= 100);
```

- [ ] **Step 2: Apply locally and verify**

Run: `npm run db:reset` (or `supabase migration up` if a local stack is running).
Expected: migration applies; `\d merchants` (or a `select column_name from information_schema.columns where table_name='merchants'`) shows `completion_rate`, `dispute_rate`.
If no local Supabase stack is available, apply via the Supabase MCP `apply_migration` to the dev project, or note that it must be applied before the backend writes these columns.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260627000000_add_merchant_rate_columns.sql
git commit -m "feat(db): add merchants.completion_rate / dispute_rate (#136)"
```

---

## Task 4: Trade summary (pure) — TDD

**Files:**
- Create: `apps/backend/src/domains/platform/stats/trade-summary.ts`, `trade-summary.spec.ts`

- [ ] **Step 1: Write the failing test `trade-summary.spec.ts`**

```ts
import { summarizeTrades, type TradeRow } from '@domains/platform/stats/trade-summary';

const NOW = Date.parse('2026-06-26T00:00:00Z');
const day = 86_400_000;

function t(partial: Partial<TradeRow>): TradeRow {
  return {
    status: 'completed',
    fiat_amount: 100,
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
        t({ status: 'completed', buyer_id: 'x', seller_id: 'x', fiat_amount: 100 }),
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
        t({ status: 'completed', completed_at: new Date(NOW - 5 * day).toISOString() }),
        t({ status: 'completed', completed_at: new Date(NOW - 2 * day).toISOString() }),
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
    const input = [t({ status: 'completed', fiat_amount: 100 }), t({ status: 'disputed' })];
    expect(summarizeTrades(input, NOW)).toEqual(summarizeTrades(input, NOW));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- trade-summary`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `trade-summary.ts`**

```ts
export interface TradeRow {
  status: string;
  fiat_amount: number | string;
  completed_at: string | null;
  buyer_id: string | null;
  seller_id: string | null;
}

export interface TradeSummary {
  completed: number;
  disputed: number;
  cancelledFailed: number;
  volume: number;
  daysSinceLastCompleted: number | null;
}

const DAY_MS = 86_400_000;

export function summarizeTrades(trades: TradeRow[], now: number): TradeSummary {
  let completed = 0;
  let disputed = 0;
  let cancelledFailed = 0;
  let volume = 0;
  let lastCompletedMs: number | null = null;

  for (const tr of trades) {
    if (tr.buyer_id && tr.seller_id && tr.buyer_id === tr.seller_id) {
      continue; // self-trade
    }
    const amount = Number(tr.fiat_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue; // zero/invalid amount
    }
    switch (tr.status) {
      case 'completed': {
        completed += 1;
        volume += amount;
        if (tr.completed_at) {
          const ms = Date.parse(tr.completed_at);
          if (!Number.isNaN(ms) && (lastCompletedMs === null || ms > lastCompletedMs)) {
            lastCompletedMs = ms;
          }
        }
        break;
      }
      case 'disputed':
      case 'resolved':
        disputed += 1;
        break;
      case 'cancelled':
      case 'failed':
        cancelledFailed += 1;
        break;
      default:
        break; // 'pending' and anything else are ignored
    }
  }

  return {
    completed,
    disputed,
    cancelledFailed,
    volume,
    daysSinceLastCompleted:
      lastCompletedMs === null ? null : (now - lastCompletedMs) / DAY_MS,
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- trade-summary`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
git add apps/backend/src/domains/platform/stats/trade-summary.ts apps/backend/src/domains/platform/stats/trade-summary.spec.ts
git commit -m "feat(backend): add pure trade-summary aggregation + tests (#136)"
```

---

## Task 5: StatsService (recompute + persist)

**Files:**
- Create: `apps/backend/src/domains/platform/stats/stats.service.ts`, `stats.service.spec.ts`

- [ ] **Step 1: Write `stats.service.spec.ts` (idempotency with a recording mock)**

```ts
import { ConfigService } from '@nestjs/config';
import { ReputationService } from '@domains/platform/reputation/reputation.service';
import { StatsService } from '@domains/platform/stats/stats.service';

// Minimal chainable Supabase mock: trades select returns a fixed set; updates are recorded.
function makeSupabase(trades: any[], merchantRow: any | null) {
  const updates: Array<{ table: string; payload: any }> = [];
  const client = {
    from(table: string) {
      const builder: any = {
        _table: table,
        _payload: null as any,
        select() { return builder; },
        or() { return builder; },
        eq() { return builder; },
        maybeSingle() {
          if (table === 'merchants') return Promise.resolve({ data: merchantRow, error: null });
          return Promise.resolve({ data: null, error: null });
        },
        update(payload: any) { builder._payload = payload; return builder; },
        then(resolve: any) {
          // SELECT trades resolves to the trade list; UPDATE resolves ok and is recorded
          if (builder._payload) {
            updates.push({ table, payload: builder._payload });
            return Promise.resolve({ data: null, error: null }).then(resolve);
          }
          if (table === 'trades') return Promise.resolve({ data: trades, error: null }).then(resolve);
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
      status: 'completed', fiat_amount: 100, completed_at: '2026-06-25T00:00:00Z',
      buyer_id: 'other', seller_id: 'u1',
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
    expect(a.updates).toEqual(b.updates);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- stats.service`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `stats.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ReputationService } from '@domains/platform/reputation/reputation.service';
import { summarizeTrades, type TradeRow } from '@domains/platform/stats/trade-summary';

export interface UserStats {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
}
export interface MerchantStats {
  rating: number;
  total_trades: number;
  volume_traded: number;
  completion_rate: number;
  dispute_rate: number;
}

const TRADE_COLUMNS = 'status, fiat_amount, completed_at, buyer_id, seller_id';

@Injectable()
export class StatsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly reputation: ReputationService
  ) {}

  async recomputeForUser(userId: string): Promise<UserStats> {
    const { data: trades, error } = await this.supabase.client
      .from('trades')
      .select(TRADE_COLUMNS)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    if (error) {
      throw new Error(`Failed to load trades for user ${userId}: ${error.message}`);
    }
    const summary = summarizeTrades((trades ?? []) as TradeRow[], Date.now());
    const stats: UserStats = {
      reputation_score: this.reputation.score(summary),
      total_trades: summary.completed,
      total_volume: summary.volume,
    };
    const { error: updErr } = await this.supabase.client
      .from('users')
      .update({ ...stats, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (updErr) {
      throw new Error(`Failed to update user ${userId}: ${updErr.message}`);
    }

    await this.recomputeMerchantForUser(userId);
    return stats;
  }

  private async recomputeMerchantForUser(userId: string): Promise<void> {
    const { data: merchant } = await this.supabase.client
      .from('merchants')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!merchant) {
      return;
    }
    const { data: trades, error } = await this.supabase.client
      .from('trades')
      .select(TRADE_COLUMNS)
      .eq('seller_id', userId); // merchant = seller role only
    if (error) {
      throw new Error(`Failed to load merchant trades for ${userId}: ${error.message}`);
    }
    const summary = summarizeTrades((trades ?? []) as TradeRow[], Date.now());
    const { completionRate, disputeRate } = this.reputation.rates(summary);
    const merchantStats: MerchantStats = {
      rating: this.reputation.score(summary),
      total_trades: summary.completed,
      volume_traded: summary.volume,
      completion_rate: completionRate,
      dispute_rate: disputeRate,
    };
    const { error: updErr } = await this.supabase.client
      .from('merchants')
      .update({ ...merchantStats, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);
    if (updErr) {
      throw new Error(`Failed to update merchant ${merchant.id}: ${updErr.message}`);
    }
  }

  async recomputeForUsers(userIds: string[]): Promise<UserStats[]> {
    const unique = [...new Set(userIds)];
    const results: UserStats[] = [];
    for (const id of unique) {
      results.push(await this.recomputeForUser(id));
    }
    return results;
  }

  async recomputeAll(): Promise<{ users: number }> {
    const pageSize = 500;
    let from = 0;
    let count = 0;
    for (;;) {
      const { data, error } = await this.supabase.client
        .from('users')
        .select('id')
        .range(from, from + pageSize - 1);
      if (error) {
        throw new Error(`Failed to page users: ${error.message}`);
      }
      const rows = data ?? [];
      for (const row of rows as Array<{ id: string }>) {
        await this.recomputeForUser(row.id);
        count += 1;
      }
      if (rows.length < pageSize) {
        break;
      }
      from += pageSize;
    }
    return { users: count };
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data } = await this.supabase.client
      .from('users')
      .select('reputation_score, total_trades, total_volume')
      .eq('id', userId)
      .maybeSingle();
    if (!data) {
      return null;
    }
    return {
      reputation_score: Number(data.reputation_score ?? 0),
      total_trades: Number(data.total_trades ?? 0),
      total_volume: Number(data.total_volume ?? 0),
    };
  }

  async getMerchantStats(merchantId: string): Promise<MerchantStats | null> {
    const { data } = await this.supabase.client
      .from('merchants')
      .select('rating, total_trades, volume_traded, completion_rate, dispute_rate')
      .eq('id', merchantId)
      .maybeSingle();
    if (!data) {
      return null;
    }
    return {
      rating: Number(data.rating ?? 0),
      total_trades: Number(data.total_trades ?? 0),
      volume_traded: Number(data.volume_traded ?? 0),
      completion_rate: Number(data.completion_rate ?? 0),
      dispute_rate: Number(data.dispute_rate ?? 0),
    };
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- stats.service`
Expected: PASS (2 tests). If the chainable mock's `.then` interaction is flaky, adjust the mock (not the service) so SELECT resolves to trades and UPDATE records the payload.

- [ ] **Step 5: Commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
git add apps/backend/src/domains/platform/stats/stats.service.ts apps/backend/src/domains/platform/stats/stats.service.spec.ts
git commit -m "feat(backend): add StatsService recompute + read (#136)"
```

---

## Task 6: Read API + internal recompute endpoints, module wiring

**Files:**
- Create: `apps/backend/src/domains/platform/stats/dto/recompute.dto.ts`, `stats.controller.ts`, `stats.module.ts`, `apps/backend/src/domains/platform/platform.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `dto/recompute.dto.ts`**

```ts
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class RecomputeDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds!: string[];
}
```

- [ ] **Step 2: Create `stats.controller.ts`**

```ts
import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { StatsService } from '@domains/platform/stats/stats.service';
import { RecomputeDto } from '@domains/platform/stats/dto/recompute.dto';

@ApiTags('stats')
@Controller()
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('users/:id/stats')
  @ApiOperation({ summary: 'Get persisted reputation + trade stats for a user.' })
  async userStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.stats.getUserStats(id);
    if (!data) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    }
    return data;
  }

  @Get('merchants/:id/stats')
  @ApiOperation({ summary: 'Get persisted reputation + trade stats for a merchant.' })
  async merchantStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.stats.getMerchantStats(id);
    if (!data) {
      throw new NotFoundException({ code: 'MERCHANT_NOT_FOUND' });
    }
    return data;
  }

  @Post('internal/stats/recompute')
  @ApiOperation({ summary: 'Recompute + persist stats for the given users (and their merchant).' })
  async recompute(@Body() dto: RecomputeDto) {
    return { results: await this.stats.recomputeForUsers(dto.userIds) };
  }

  @Post('internal/stats/recompute-all')
  @ApiOperation({ summary: 'Recompute + persist stats for every user (idempotent).' })
  async recomputeAll() {
    return this.stats.recomputeAll();
  }
}
```

- [ ] **Step 3: Create `stats.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ReputationModule } from '@domains/platform/reputation/reputation.module';
import { StatsController } from '@domains/platform/stats/stats.controller';
import { StatsService } from '@domains/platform/stats/stats.service';

@Module({
  imports: [ReputationModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
```

- [ ] **Step 4: Create `platform.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { StatsModule } from '@domains/platform/stats/stats.module';

@Module({
  imports: [StatsModule],
})
export class PlatformModule {}
```

- [ ] **Step 5: Import `PlatformModule` in `apps/backend/src/app.module.ts`**

Add `import { PlatformModule } from '@domains/platform/platform.module';` and add `PlatformModule` to the `imports` array (after `CoreModule`). `SupabaseModule` is `@Global`, so `StatsService` can inject `SupabaseService` without re-importing.

- [ ] **Step 6: Build + verify endpoints (needs a real `.env` with service-role key + `INTERNAL_API_KEY`)**

```bash
cd apps/backend && rm -rf dist *.tsbuildinfo && npm run build && cd ../..
( cd apps/backend && node dist/main.js & sleep 2 ; \
  KEY=$(grep '^INTERNAL_API_KEY=' apps/backend/.env | cut -d= -f2) ; \
  echo -n "no key -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/v1/internal/stats/recompute-all -X POST ; \
  echo -n "recompute-all -> " ; curl -s -o /dev/null -w "%{http_code}\n" -H "x-internal-key: $KEY" -X POST localhost:3001/v1/internal/stats/recompute-all ; \
  echo -n "user stats (random uuid) -> " ; curl -s -o /dev/null -w "%{http_code}\n" -H "x-internal-key: $KEY" localhost:3001/v1/users/00000000-0000-0000-0000-000000000000/stats ; \
  kill %1 )
```
Expected: `no key -> 401`; `recompute-all -> 200`; unknown user `-> 404`. Also confirm DI metadata: `grep -n "design:paramtypes" apps/backend/dist/domains/platform/stats/stats.service.js` references `SupabaseService` and `ReputationService` (not `[void 0]`). Clean up dist/tsbuildinfo.

- [ ] **Step 7: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/domains/platform apps/backend/src/app.module.ts
git commit -m "feat(backend): add stats read API + internal recompute endpoints (#136)"
```

---

## Task 7: Web — server-only backend client + require-user helper

**Files:**
- Create: `apps/web/lib/services/backend.ts`, `apps/web/lib/api/require-user.ts`

- [ ] **Step 1: Inspect the existing auth pattern**

Read `apps/web/app/api/admin/merchants/route.ts` and the `requireAdmin` helper it imports (search `requireAdmin`). Mirror its token extraction + Supabase `auth.getUser(token)` usage exactly for `requireUser`.

- [ ] **Step 2: Create `apps/web/lib/services/backend.ts`**

```ts
import 'server-only';

export async function backendFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const baseUrl = process.env.BACKEND_URL;
  const key = process.env.INTERNAL_API_KEY;
  if (!baseUrl || !key) {
    throw new Error('BACKEND_URL / INTERNAL_API_KEY are not configured');
  }
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-internal-key': key,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
}
```
If `server-only` is not installed, run `npm install server-only -w @pacto-p2p/web` (it is a tiny standard Next helper that errors if imported into a client bundle).

- [ ] **Step 3: Create `apps/web/lib/api/require-user.ts`** (adapt to the real `requireAdmin` you read in Step 1)

```ts
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

export async function requireUser(
  request: NextRequest
): Promise<{ id: string } | NextResponse> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { id: user.id };
}
```

- [ ] **Step 4: Type-check + biome + commit**

```bash
npm run type-check
cd apps/web && npm run biome:fix && npm run biome:check && cd ../..
git add apps/web/lib/services/backend.ts apps/web/lib/api/require-user.ts package-lock.json apps/web/package.json
git commit -m "feat(web): add server-only backend client + requireUser (#136)"
```

---

## Task 8: Web — user stats from the backend (ProfileStats)

**Files:**
- Create: `apps/web/app/api/stats/me/route.ts`, `apps/web/hooks/use-user-stats.ts`
- Modify: `apps/web/components/profile/ProfileStats.tsx`

- [ ] **Step 1: Create `apps/web/app/api/stats/me/route.ts`**

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const res = await backendFetch(`/v1/users/${auth.id}/stats`);
  if (res.status === 404) {
    return NextResponse.json(
      { reputation_score: 0, total_trades: 0, total_volume: 0 },
      { status: 200 }
    );
  }
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
```

- [ ] **Step 2: Create `apps/web/hooks/use-user-stats.ts`** (mirror the auth-header pattern from `apps/web/hooks/use-admin.ts`)

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
}

async function fetchUserStats(): Promise<UserStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch('/api/stats/me', {
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {},
  });
  if (!res.ok) {
    throw new Error('Failed to load user stats');
  }
  return res.json();
}

export function useUserStats(enabled = true) {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
    enabled,
    staleTime: 30_000,
  });
}
```

- [ ] **Step 2b: Run the source check**

Run: `rg -n "reputation_score|total_trades|total_volume" apps/web/components/profile/ProfileStats.tsx`
Expected: confirms which props the component renders so Step 3 swaps the source without changing the layout.

- [ ] **Step 3: Update `ProfileStats.tsx` to read from `useUserStats`**

Replace the `stats` values it currently receives from props/`useAuth` with values from `useUserStats()` (fall back to the existing prop values while loading so the UI doesn't flicker). Keep the same rendered markup/labels; only the data source for `reputation_score`, `total_trades`, `total_volume` changes to the hook. (The `created_at` "member since" stays from the existing user object.)

- [ ] **Step 4: Verify in the app**

Run: `npm run dev:backend` (backend up) and `npm run dev` (web). Open the profile page; `ProfileStats` shows values fetched via `/api/stats/me`. Network tab shows the `/api/stats/me` call returning the backend values. With no completed trades the values are 0 / neutral as expected.

- [ ] **Step 5: Type-check + biome + commit**

```bash
npm run type-check
cd apps/web && npm run biome:fix && npm run biome:check && cd ../..
git add apps/web/app/api/stats/me apps/web/hooks/use-user-stats.ts apps/web/components/profile/ProfileStats.tsx
git commit -m "feat(web): read user stats from backend API in ProfileStats (#136)"
```

---

## Task 9: Web — merchant page reads backend + seller-only filter alignment

**Files:**
- Modify: `apps/web/app/m/[slug]/page.tsx`, `apps/web/lib/adapters/merchant.supabase.ts`

- [ ] **Step 1: Align the client-side trade filter to seller-only**

In `apps/web/lib/adapters/merchant.supabase.ts`, the trade queries in `getKpis`, `getVolumeSeries`, and `getSpeedHistogram` currently match `buyer_id OR seller_id` (an `.or(...)` filter) against the merchant's `user_id`. Change each to **seller-only**: `.eq('seller_id', userId)` (drop the `.or(...)`). Read the file first to find the exact filter expressions; keep everything else identical. This makes the client charts consistent with the backend's seller-only merchant metrics and #106's intent.

- [ ] **Step 2: Fetch merchant core stats from the backend in the page**

In `apps/web/app/m/[slug]/page.tsx` (a server component), after resolving the merchant (`merchant.id`), add a backend fetch for the core numbers:

```ts
import { backendFetch } from '@/lib/services/backend';
// ...
let coreStats = {
  rating: merchant.rating,
  total_trades: merchant.total_trades,
  volume_traded: merchant.volume_traded,
  completion_rate: 0,
  dispute_rate: 0,
};
try {
  const res = await backendFetch(`/v1/merchants/${merchant.id}/stats`);
  if (res.ok) {
    coreStats = await res.json();
  }
} catch {
  // best-effort: fall back to the merchant row values already loaded
}
```
Use `coreStats.rating` / `total_trades` / `volume_traded` / `completion_rate` / `dispute_rate` for the header/KPI core figures. The existing `getKpis` (now seller-only) still supplies `volume_30d` / `median_release_minutes` and the charts. Read the page first to wire `coreStats` into the existing JSX without changing layout.

- [ ] **Step 3: Verify**

Run backend + web. Open a merchant public page (`/m/<slug>`). The rating / total trades / volume / completion% / dispute% render from `coreStats` (backend). Confirm via the server logs / network that `/v1/merchants/:id/stats` is hit. For a merchant with completed seller-side trades, values are non-zero and match a manual recompute.

- [ ] **Step 4: Type-check + biome + commit**

```bash
npm run type-check
cd apps/web && npm run biome:fix && npm run biome:check && cd ../..
git add apps/web/app/m/[slug]/page.tsx apps/web/lib/adapters/merchant.supabase.ts
git commit -m "feat(web): merchant page reads core stats from backend; seller-only filters (#136)"
```

---

## Task 10: Web — trigger recompute on trade completion/dispute

**Files:**
- Create: `apps/web/app/api/stats/recompute/route.ts`
- Modify: `apps/web/hooks/use-trades.ts`

- [ ] **Step 1: Create `apps/web/app/api/stats/recompute/route.ts`**

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const body = (await request.json().catch(() => null)) as {
    userIds?: unknown;
  } | null;
  const userIds = Array.isArray(body?.userIds)
    ? body.userIds.filter((v): v is string => typeof v === 'string')
    : [];
  // Only allow recomputing entities the caller is part of (best-effort guard).
  const allowed = userIds.filter((id) => id === auth.id);
  const targets = allowed.length > 0 ? allowed : [auth.id];
  const res = await backendFetch('/v1/internal/stats/recompute', {
    method: 'POST',
    body: JSON.stringify({ userIds: targets }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
```
Note: the caller can only recompute their own user id here (the counterparty's stats are picked up by the counterparty's own trigger or the Phase 3 nightly reconcile). This keeps the route from being an arbitrary recompute oracle. If product wants both parties recomputed immediately, widen `allowed` to include verified trade counterparties in a follow-up.

- [ ] **Step 2: Add a best-effort trigger helper and call it after completion/dispute in `use-trades.ts`**

Read `apps/web/hooks/use-trades.ts` around `useReleaseFunds` (the `TradesService.updateTrade(..., { status: 'completed' })` site) and `useDisputeEscrow`. After each succeeds, add a fire-and-forget call:

```ts
// helper near the top of the hook module
async function triggerStatsRecompute() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch('/api/stats/recompute', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({ userIds: [] }), // route defaults to the caller's id
    });
  } catch {
    // best-effort: nightly reconcile (Phase 3) is the backstop
  }
}
```
Call `void triggerStatsRecompute();` right after the successful `status: 'completed'` update and after a successful dispute. It must NOT block or throw into the trade flow. (`supabase` is already imported in this hook module; reuse it.)

- [ ] **Step 3: Verify end-to-end**

With backend + web running and a real (test) trade you can complete: complete the trade, then check the `users` row for the caller updated (`total_trades`/`reputation_score` changed) and the `/api/stats/recompute` call returned 200 in the network tab. Re-completing/re-triggering yields the same values (idempotent).

- [ ] **Step 4: Type-check + biome + commit**

```bash
npm run type-check
cd apps/web && npm run biome:fix && npm run biome:check && cd ../..
git add apps/web/app/api/stats/recompute apps/web/hooks/use-trades.ts
git commit -m "feat(web): trigger stats recompute on trade completion/dispute (#136)"
```

---

## Task 11: Full verification + PR

**Files:** none (verification + PR)

- [ ] **Step 1: Backend test + lint + build**

```bash
cd apps/backend && npm test && npm run biome:check && cd ../..
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
npm run type-check
npm run build
```
Expected: Jest green; backend biome clean; type-check + build pass (root). Root `biome:check` may stay red on pre-existing `packages/*` debt only.

- [ ] **Step 2: Runtime acceptance check**

Apply the migration if not yet applied. Boot the backend with a real service-role key, then:
```bash
KEY=$(grep '^INTERNAL_API_KEY=' apps/backend/.env | cut -d= -f2)
curl -s -H "x-internal-key: $KEY" -X POST localhost:3001/v1/internal/stats/recompute-all   # 200 { users: N }
# pick a user id that has completed trades:
curl -s -H "x-internal-key: $KEY" localhost:3001/v1/users/<id>/stats                        # non-zero
curl -s -H "x-internal-key: $KEY" -X POST localhost:3001/v1/internal/stats/recompute -d '{"userIds":["<id>"]}'
curl -s -H "x-internal-key: $KEY" localhost:3001/v1/users/<id>/stats                        # identical (idempotent)
```
Confirm the 4 acceptance criteria: trade completion updates rows, recompute is idempotent, scores come from the configurable model, web profile/merchant pages read from the backend.

- [ ] **Step 3: Push + open PR**

```bash
git push -u origin feat/136-stats-reputation
gh pr create --repo PACTO-LAT/pacto-p2p --base develop --head feat/136-stats-reputation \
  --title "feat(backend): merchant/user stats + reputation + read API (phase 2 — #136)" \
  --body "<summary, acceptance evidence, links to spec, note FX deferred to #149>"
```
(No `Co-Authored-By`, no "Generated with Claude" footer.)

---

## Self-review checklist (completed during planning)

- **Spec coverage:** reputation engine + config (T2), migration (T3), aggregation/idempotency (T4/T5), read API + recompute endpoints (T6), web user stats (T8), merchant page + seller-only alignment (T9), trade-completion trigger (T10), Jest (T1), verification (T11). All spec sections map to a task.
- **Type consistency:** `ReputationInput` (T2) is consumed by `summarizeTrades`'s `TradeSummary` (T4) — `TradeSummary` is a structural superset (same fields the engine reads), passed directly to `score()`/`rates()` in `StatsService` (T5). `UserStats`/`MerchantStats` shapes are identical across `StatsService`, the controller responses, and the web consumers.
- **No placeholders:** every code step has complete code; the only `<...>` are runtime values (a real user id, the migration applied, the PR body) that cannot be known until execution.
- **Known risks called out:** the `StatsService` unit test relies on a hand-rolled chainable Supabase mock (Step 4 notes adjusting the mock if `.then` interaction is flaky); `server-only` may need installing (T7); `requireUser` must be adapted to the real `requireAdmin` (T7 Step 1). The recompute route intentionally only recomputes the caller's own id (documented), with the counterparty covered by their own trigger / the Phase 3 reconcile.
- **Out of scope (per spec):** FX normalization (#149), moving charts to backend, the nightly schedule (#137), DB webhooks.
