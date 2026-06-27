# Backend Phase 3 — Cron Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `@nestjs/schedule` cron infrastructure to `apps/backend` plus two scheduled jobs: a nightly stats reconcile (`StatsService.recomputeAll()`) and a dispute-SLA scanner that logs overdue disputes.

**Architecture:** Two cron providers in `domains/platform/jobs` register their jobs via `SchedulerRegistry` in `onModuleInit` (so schedules come from env at runtime, which the `@Cron` decorator can't do). Each is overlap-guarded and never throws. The overdue-dispute selection is a pure, unit-tested function fed by a service query over existing data (no migration).

**Tech Stack:** NestJS 11, `@nestjs/schedule` (+ `cron`), `@supabase/supabase-js` (service role), `@nestjs/config` (Joi), Jest.

**Spec:** `docs/superpowers/specs/2026-06-26-backend-phase3-cron-design.md`
**Branch:** `feat/137-cron-jobs` (stacked on `feat/136-stats-reputation`; depends on phase 2's `StatsService`).
**Build hygiene:** `rm -rf apps/backend/dist apps/backend/*.tsbuildinfo` before any backend build. Run the backend from `apps/backend` (dotenv uses cwd).
**DI footgun:** keep injected deps (`ConfigService`, `SchedulerRegistry`, `SupabaseService`, `StatsService`, `DisputesService`) as VALUE imports; add `// biome-ignore lint/style/useImportType: required for NestJS dependency injection` if Biome rewrites them. After `biome:fix`, grep to confirm. Pure-type imports (`OnModuleInit`, row interfaces) stay `import type`.

---

## File map

| File | Responsibility |
|---|---|
| `apps/backend/package.json` (mod) | add `@nestjs/schedule` |
| `apps/backend/src/config/env.validation.ts` (mod), `.env.example` (mod) | `CRON_*` / `DISPUTE_SLA_*` env (defaulted) |
| `apps/backend/src/app.module.ts` (mod) | `ScheduleModule.forRoot()` |
| `apps/backend/src/domains/platform/disputes/disputes.service.ts` | `selectOverdue` (pure) + `findOverdueDisputes` (query) |
| `.../disputes/disputes.service.spec.ts` | overdue-selection unit tests |
| `.../disputes/disputes.module.ts` | provides/exports `DisputesService` |
| `.../jobs/stats-reconcile.cron.ts` | nightly reconcile cron |
| `.../jobs/dispute-sla.cron.ts` | dispute SLA cron (logs breaches) |
| `.../jobs/dispute-sla.cron.spec.ts` | `run()` emits alerts for overdue disputes |
| `.../jobs/jobs.module.ts` | imports StatsModule + DisputesModule; declares the crons |
| `apps/backend/src/domains/platform/platform.module.ts` (mod) | import `JobsModule` |

---

## Task 1: Cron infrastructure (schedule module + env)

**Files:**
- Modify: `apps/backend/package.json`, `apps/backend/src/app.module.ts`, `apps/backend/src/config/env.validation.ts`, `apps/backend/.env.example`

- [ ] **Step 1: Add the dependency**

In `apps/backend/package.json` `dependencies`, add `"@nestjs/schedule": "^4.1.0"`. (It bundles the `cron` package.)

- [ ] **Step 2: Install**

Run: `npm install` (root). If a peer conflict with `@nestjs/core@11` appears, use the `@nestjs/schedule` major compatible with Nest 11 (`^4` or `^5`) and report the choice.

- [ ] **Step 3: Add cron env to `apps/backend/src/config/env.validation.ts`**

Inside the `Joi.object({ ... })`, add:
```ts
  CRON_ENABLED: Joi.boolean().default(true),
  RECONCILE_CRON: Joi.string().default('0 3 * * *'),
  DISPUTE_SLA_CRON: Joi.string().default('0 * * * *'),
  DISPUTE_SLA_HOURS: Joi.number().positive().default(48),
```

- [ ] **Step 4: Document them in `apps/backend/.env.example`**

Append:
```dotenv

# Scheduled jobs (cron) — all optional with defaults
CRON_ENABLED=true
# Nightly stats reconcile (cron expression)
RECONCILE_CRON=0 3 * * *
# Dispute SLA scan (cron expression)
DISPUTE_SLA_CRON=0 * * * *
# A dispute open longer than this many hours is "overdue"
DISPUTE_SLA_HOURS=48
```

- [ ] **Step 5: Register `ScheduleModule` in `apps/backend/src/app.module.ts`**

Add `import { ScheduleModule } from '@nestjs/schedule';` and add `ScheduleModule.forRoot()` to the `imports` array (e.g. right after `ConfigModule.forRoot(...)`). Do not change anything else.

- [ ] **Step 6: Build + boot smoke**

Run: `rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build) && (cd apps/backend && node dist/main.js & sleep 2 ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/health ; kill %1)`
Expected: build OK; `/health` responds (200 or 503). App boots with ScheduleModule loaded.

- [ ] **Step 7: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/package.json apps/backend/src/app.module.ts apps/backend/src/config/env.validation.ts apps/backend/.env.example package-lock.json
git commit -m "feat(backend): add @nestjs/schedule cron infrastructure + env (#137)"
```

---

## Task 2: DisputesService + overdue selection (TDD)

**Files:**
- Create: `apps/backend/src/domains/platform/disputes/disputes.service.ts`, `disputes.service.spec.ts`, `disputes.module.ts`

- [ ] **Step 1: Write the failing test `disputes.service.spec.ts`**

```ts
import { selectOverdue, type DisputeRow } from '@domains/platform/disputes/disputes.service';

const NOW = Date.parse('2026-06-26T00:00:00Z');
const H = 3_600_000;

function row(hoursAgo: number, status: string, overrides: Partial<DisputeRow> = {}): DisputeRow {
  return {
    created_at: new Date(NOW - hoursAgo * H).toISOString(),
    trade_chats: {
      escrow_id: 'e1',
      buyer_id: 'b1',
      seller_id: 's1',
      escrows: { status, engagement_id: 'eng1' },
    },
    ...overrides,
  };
}

describe('selectOverdue', () => {
  it('includes active disputes older than the threshold', () => {
    const out = selectOverdue([row(50, 'active')], NOW, 48);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ escrowId: 'e1', engagementId: 'eng1', buyerId: 'b1', sellerId: 's1' });
    expect(out[0].hoursOpen).toBeCloseTo(50, 5);
  });

  it('excludes disputes younger than the threshold', () => {
    expect(selectOverdue([row(10, 'active')], NOW, 48)).toHaveLength(0);
  });

  it('excludes resolved/cancelled/completed disputes regardless of age', () => {
    const rows = [row(100, 'resolved'), row(100, 'cancelled'), row(100, 'completed')];
    expect(selectOverdue(rows, NOW, 48)).toHaveLength(0);
  });

  it('skips rows with no chat or no escrow', () => {
    const noChat: DisputeRow = { created_at: new Date(NOW - 100 * H).toISOString(), trade_chats: null };
    const noEscrow = row(100, 'active', {
      trade_chats: { escrow_id: 'e1', buyer_id: 'b1', seller_id: 's1', escrows: null },
    });
    expect(selectOverdue([noChat, noEscrow], NOW, 48)).toHaveLength(0);
  });

  it('skips rows with an unparseable timestamp', () => {
    const bad = row(100, 'active', { created_at: 'not-a-date' });
    expect(selectOverdue([bad], NOW, 48)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- disputes.service`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `disputes.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';

export interface DisputeRow {
  created_at: string;
  trade_chats: {
    escrow_id: string | null;
    buyer_id: string | null;
    seller_id: string | null;
    escrows: { status: string; engagement_id: string } | null;
  } | null;
}

export interface OverdueDispute {
  escrowId: string;
  engagementId: string;
  buyerId: string | null;
  sellerId: string | null;
  disputeRaisedAt: string;
  hoursOpen: number;
}

const HOUR_MS = 3_600_000;

export function selectOverdue(
  rows: DisputeRow[],
  now: number,
  thresholdHours: number
): OverdueDispute[] {
  const out: OverdueDispute[] = [];
  for (const r of rows) {
    const chat = r.trade_chats;
    const escrow = chat?.escrows;
    if (!chat || !escrow || !chat.escrow_id) {
      continue;
    }
    if (escrow.status !== 'active') {
      continue; // resolved / cancelled / completed = not an open dispute
    }
    const raisedMs = Date.parse(r.created_at);
    if (Number.isNaN(raisedMs)) {
      continue;
    }
    const hoursOpen = (now - raisedMs) / HOUR_MS;
    if (hoursOpen <= thresholdHours) {
      continue;
    }
    out.push({
      escrowId: chat.escrow_id,
      engagementId: escrow.engagement_id,
      buyerId: chat.buyer_id,
      sellerId: chat.seller_id,
      disputeRaisedAt: r.created_at,
      hoursOpen: Math.round(hoursOpen * 100) / 100,
    });
  }
  return out;
}

@Injectable()
export class DisputesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findOverdueDisputes(
    now: number,
    thresholdHours: number
  ): Promise<OverdueDispute[]> {
    const cutoffIso = new Date(now - thresholdHours * HOUR_MS).toISOString();
    const { data, error } = await this.supabase.client
      .from('trade_messages')
      .select(
        'created_at, metadata, trade_chats!inner(escrow_id, buyer_id, seller_id, escrows!inner(status, engagement_id))'
      )
      .eq('message_type', 'system')
      .eq('metadata->>event', 'dispute_raised')
      .lte('created_at', cutoffIso);
    if (error) {
      throw new Error(`Failed to load disputes: ${error.message}`);
    }
    return selectOverdue(
      (data ?? []) as unknown as DisputeRow[],
      now,
      thresholdHours
    );
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- disputes.service`
Expected: PASS (5 tests).

- [ ] **Step 5: Create `disputes.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { DisputesService } from '@domains/platform/disputes/disputes.service';

@Module({
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
```

- [ ] **Step 6: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/domains/platform/disputes
git commit -m "feat(backend): add DisputesService + overdue-dispute selection + tests (#137)"
```

---

## Task 3: Cron jobs (reconcile + dispute SLA) + wiring

**Files:**
- Create: `apps/backend/src/domains/platform/jobs/stats-reconcile.cron.ts`, `dispute-sla.cron.ts`, `dispute-sla.cron.spec.ts`, `jobs.module.ts`
- Modify: `apps/backend/src/domains/platform/platform.module.ts`

- [ ] **Step 1: Create `stats-reconcile.cron.ts`**

```ts
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { StatsService } from '@domains/platform/stats/stats.service';
import { CronJob } from 'cron';

@Injectable()
export class StatsReconcileCron implements OnModuleInit {
  private readonly logger = new Logger(StatsReconcileCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly stats: StatsService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → stats-reconcile not scheduled');
      return;
    }
    const expr = this.config.get<string>('RECONCILE_CRON', '0 3 * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('stats-reconcile', job);
    job.start();
    this.logger.log(`stats-reconcile scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('stats-reconcile already running; skipping tick');
      return;
    }
    this.isRunning = true;
    const start = Date.now();
    try {
      const result = await this.stats.recomputeAll();
      this.logger.log(
        `stats-reconcile done users=${result.users} durationMs=${Date.now() - start}`
      );
    } catch (err) {
      this.logger.error(`stats-reconcile failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
```

- [ ] **Step 2: Create `dispute-sla.cron.ts`**

```ts
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { DisputesService } from '@domains/platform/disputes/disputes.service';
import { CronJob } from 'cron';

@Injectable()
export class DisputeSlaCron implements OnModuleInit {
  private readonly logger = new Logger(DisputeSlaCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly disputes: DisputesService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → dispute-sla not scheduled');
      return;
    }
    const expr = this.config.get<string>('DISPUTE_SLA_CRON', '0 * * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('dispute-sla', job);
    job.start();
    this.logger.log(`dispute-sla scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('dispute-sla already running; skipping tick');
      return;
    }
    this.isRunning = true;
    try {
      const thresholdHours = this.config.get<number>('DISPUTE_SLA_HOURS', 48);
      const overdue = await this.disputes.findOverdueDisputes(
        Date.now(),
        thresholdHours
      );
      for (const d of overdue) {
        this.logger.warn(
          `dispute_sla_breach escrowId=${d.escrowId} engagementId=${d.engagementId} ` +
            `buyerId=${d.buyerId} sellerId=${d.sellerId} hoursOpen=${d.hoursOpen}`
        );
      }
      this.logger.log(
        `dispute-sla done thresholdHours=${thresholdHours} overdueCount=${overdue.length}`
      );
    } catch (err) {
      this.logger.error(`dispute-sla failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
```

- [ ] **Step 3: Write `dispute-sla.cron.spec.ts` (alert emission)**

```ts
import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { SchedulerRegistry } from '@nestjs/schedule';
import type { DisputesService, OverdueDispute } from '@domains/platform/disputes/disputes.service';
import { DisputeSlaCron } from '@domains/platform/jobs/dispute-sla.cron';

describe('DisputeSlaCron.run', () => {
  it('logs a breach per overdue dispute and a summary count', async () => {
    const overdue: OverdueDispute[] = [
      { escrowId: 'e1', engagementId: 'eng1', buyerId: 'b1', sellerId: 's1', disputeRaisedAt: 'x', hoursOpen: 50 },
      { escrowId: 'e2', engagementId: 'eng2', buyerId: 'b2', sellerId: 's2', disputeRaisedAt: 'y', hoursOpen: 72 },
    ];
    const config = { get: <T>(_k: string, d?: T) => d } as unknown as ConfigService;
    const scheduler = {} as unknown as SchedulerRegistry;
    const disputes = { findOverdueDisputes: jest.fn().mockResolvedValue(overdue) } as unknown as DisputesService;

    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    const cron = new DisputeSlaCron(config, scheduler, disputes);
    await cron.run();

    expect(disputes.findOverdueDisputes).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('dispute_sla_breach');
    expect(log.mock.calls.some((c) => String(c[0]).includes('overdueCount=2'))).toBe(true);

    warn.mockRestore();
    log.mockRestore();
  });
});
```

- [ ] **Step 4: Run to verify the cron test passes**

Run: `cd apps/backend && npm test -- dispute-sla`
Expected: PASS (1 test). If `findOverdueDisputes` typing complains, ensure the mock cast matches.

- [ ] **Step 5: Create `jobs.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { DisputesModule } from '@domains/platform/disputes/disputes.module';
import { DisputeSlaCron } from '@domains/platform/jobs/dispute-sla.cron';
import { StatsReconcileCron } from '@domains/platform/jobs/stats-reconcile.cron';
import { StatsModule } from '@domains/platform/stats/stats.module';

@Module({
  imports: [StatsModule, DisputesModule],
  providers: [StatsReconcileCron, DisputeSlaCron],
})
export class JobsModule {}
```

- [ ] **Step 6: Add `JobsModule` to `apps/backend/src/domains/platform/platform.module.ts`**

Add `import { JobsModule } from '@domains/platform/jobs/jobs.module';` and add `JobsModule` to the `imports` array (alongside `StatsModule`).

- [ ] **Step 7: Build + boot smoke (both jobs register) + DI check**

```bash
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
cd apps/backend && npm run build && cd ../..
grep -n "design:paramtypes" apps/backend/dist/domains/platform/jobs/dispute-sla.cron.js
# → must reference ConfigService, SchedulerRegistry, DisputesService (not [void 0])
( cd apps/backend && node dist/main.js & sleep 2 ; kill %1 ) 2>&1 | grep -iE "scheduled:|not scheduled"
# → expect: "stats-reconcile scheduled: 0 3 * * *" and "dispute-sla scheduled: 0 * * * *"
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
```
Expected: both "scheduled" log lines appear; DI metadata references the real classes. (Booting needs `apps/backend/.env` with the existing real Supabase + INTERNAL_API_KEY values; the crons won't fire on the default 3am/hourly schedules during this short boot, which is fine — we only assert registration.)

- [ ] **Step 8: Verify CRON_ENABLED=false disables registration**

```bash
( cd apps/backend && CRON_ENABLED=false node dist/main.js & sleep 2 ; kill %1 ) 2>&1 | grep -i "not scheduled"
```
First `npm run build`. Expected: two "not scheduled" lines (jobs skip registration). Clean up dist afterward.

- [ ] **Step 9: Biome + type-check + full backend test + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && npm test && cd ../..
npm run type-check
git add apps/backend/src/domains/platform/jobs apps/backend/src/domains/platform/platform.module.ts
git commit -m "feat(backend): add stats-reconcile + dispute-sla cron jobs (#137)"
```

---

## Task 4: Final verification + PR

**Files:** none (verification + PR)

- [ ] **Step 1: Full verification**

```bash
cd apps/backend && npm test && npm run biome:check && cd ../..
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
npm run type-check
npm run build
```
Expected: Jest green (reputation, trade-summary, stats, disputes, dispute-sla cron); backend biome clean; type-check + build pass.

- [ ] **Step 2: Runtime smoke (optional, with a short schedule)**

To see a job actually fire, temporarily run with a seconds-based schedule:
```bash
cd apps/backend && rm -rf dist *.tsbuildinfo && npm run build && \
  RECONCILE_CRON='*/5 * * * * *' node dist/main.js & sleep 8 ; kill %1
```
Expected: within ~5s a `stats-reconcile done users=… durationMs=…` log line appears (requires the real Supabase env). Clean up dist.

- [ ] **Step 3: Push + open PR**

```bash
git push -u origin feat/137-cron-jobs
gh pr create --repo PACTO-LAT/pacto-p2p --base develop --head feat/137-cron-jobs \
  --title "feat(backend): scheduled cleanup & SLA jobs / cron (phase 3 — #137)" \
  --body "<summary; note access-code cleanup deferred (orphaned feature); SLA via existing data + pino log; depends on #136>"
```
(No `Co-Authored-By`, no "Generated with Claude" footer.) Note in the PR that this branch is stacked on #136 — if #136 isn't merged yet, the diff includes phase-2 commits until it is.

---

## Self-review checklist (completed during planning)

- **Spec coverage:** cron infra + ScheduleModule + env (T1); dispute SLA query + pure selection + tests (T2); both cron jobs + overlap guard + CRON_ENABLED + alert logging + reconcile (T3); verification + PR (T4). Access-code cleanup intentionally absent (deferred per spec — orphaned feature). Nightly reconcile = `StatsService.recomputeAll()` (T3). All in-scope spec items covered.
- **Type consistency:** `DisputeRow`/`OverdueDispute` defined in `disputes.service.ts` (T2) and consumed by the cron + its spec (T3) unchanged. `StatsService.recomputeAll()` returns `{ users: number }` (phase 2) — used in the reconcile log.
- **No placeholders:** every code step is complete; the only `<...>` is the PR body text.
- **Known external-API notes:** `@nestjs/schedule` version is a caret range (align to the Nest-11-compatible major at install). `CronJob` is imported from `cron` (bundled by `@nestjs/schedule`). Schedules are registered via `SchedulerRegistry` in `onModuleInit` (not `@Cron`) precisely because the expressions come from env at runtime. The supabase-js embedded-resource select (`trade_chats!inner(...escrows!inner(...))`) filters escrow status in JS (in `selectOverdue`) to avoid finicky nested-resource filters.
- **Out of scope (per spec):** access-code cleanup, robust dispute persistence (phase 4), real alert delivery (phase 5), multi-instance cron locking, the `listings`/`waitlist_submissions` RLS finding.
