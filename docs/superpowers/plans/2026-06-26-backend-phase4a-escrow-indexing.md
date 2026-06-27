# Backend Phase 4a — Escrow State Indexing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Have `apps/backend` poll the TrustlessWork (TLW) indexer (read-only REST), persist each escrow's on-chain state (balance, flags, status) to Supabase, serve it via a read API, and have the web dashboard escrow list read the cached state instead of calling TLW per-client.

**Architecture:** A `core/trustless` HTTP client calls `GET {baseURL}/helper/get-escrows-by-role` with the platform role + `Bearer` API key. A new `domains/escrow` context maps the on-chain `Escrow` → DB columns (pure, tested), upserts via an indexer service run by a `SchedulerRegistry` cron (reusing #137's `ScheduleModule`), and exposes a read API. The backend never signs anything (read-only).

**Tech Stack:** NestJS 11, native `fetch` (Node 23), `@nestjs/schedule` (#137), `@supabase/supabase-js` (service role), `@nestjs/config` (Joi), `@pacto-p2p/types` (`Escrow`), Jest.

**Spec:** `docs/superpowers/specs/2026-06-26-backend-phase4a-escrow-indexing-design.md`
**Branch:** `feat/138a-escrow-indexing` (stacked on `feat/137-cron-jobs` for `ScheduleModule`).
**Build hygiene:** `rm -rf apps/backend/dist apps/backend/*.tsbuildinfo` before backend builds; run from `apps/backend`.
**DI footgun:** injected deps (`ConfigService`, `SupabaseService`, `SchedulerRegistry`, `TrustlessIndexerService`, `EscrowIndexerService`, `EscrowService`) are VALUE imports with `// biome-ignore lint/style/useImportType: required for NestJS dependency injection`. `Escrow`/DTO types stay `import type`.

---

## File map

| File | Responsibility |
|---|---|
| `supabase/migrations/20260627100000_add_escrow_onchain_state.sql` | balance/token_amount/on_chain_flags/on_chain_status/last_indexed_at columns |
| `apps/backend/src/config/env.validation.ts` (mod), `.env.example` (mod) | TLW_* + ESCROW_INDEX_CRON env |
| `apps/backend/src/core/trustless/trustless.config.ts` | base URLs + typed accessors |
| `.../core/trustless/trustless-indexer.service.ts` (+ `.spec.ts`) | TLW REST client (`getPlatformEscrows`) |
| `.../core/trustless/trustless.module.ts` | provides/exports the indexer service |
| `apps/backend/src/core/core.module.ts` (mod) | import TrustlessModule |
| `apps/backend/src/domains/escrow/escrow-mapper.ts` (+ `.spec.ts`) | pure `toEscrowPatch(escrow)` |
| `.../domains/escrow/escrow-indexer.service.ts` (+ `.spec.ts`) | fetch → upsert escrow rows |
| `.../domains/escrow/escrow.service.ts` | `getEscrowsForUser` read query |
| `.../domains/escrow/escrow.controller.ts` | `GET /v1/escrows/me` |
| `.../domains/escrow/escrow-index.cron.ts` | SchedulerRegistry cron → `indexAll()` |
| `.../domains/escrow/escrow.module.ts` | wires the above |
| `apps/backend/src/app.module.ts` (mod) | import EscrowModule |
| `apps/web/app/api/escrows/route.ts` | GET proxy → `/v1/escrows/me` |
| `apps/web/hooks/use-escrows.ts` (mod) | dashboard list reads backend-served state |

---

## Task 1: Migration + TLW env

**Files:**
- Create: `supabase/migrations/20260627100000_add_escrow_onchain_state.sql`
- Modify: `apps/backend/src/config/env.validation.ts`, `apps/backend/.env.example`

- [ ] **Step 1: Create the migration**

```sql
-- Persist on-chain escrow state indexed from TrustlessWork.
ALTER TABLE escrows
  ADD COLUMN IF NOT EXISTS balance NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS token_amount NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS on_chain_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS on_chain_status TEXT,
  ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_escrows_last_indexed_at ON escrows(last_indexed_at);
```
Confirm the filename sorts after existing migrations (`ls supabase/migrations | sort | tail -3`). Do NOT apply to remote here (controller applies to dev separately).

- [ ] **Step 2: Add TLW env to `apps/backend/src/config/env.validation.ts`**

Inside the `Joi.object({ ... })`, add:
```ts
  TLW_API_KEY: Joi.string().allow('').default(''),
  TLW_NETWORK: Joi.string().valid('testnet', 'mainnet').default('testnet'),
  PLATFORM_ROLE_ADDRESS: Joi.string().allow('').default(''),
  ESCROW_INDEX_CRON: Joi.string().default('*/2 * * * *'),
```
(`TLW_API_KEY`/`PLATFORM_ROLE_ADDRESS` are `allow('')` so a missing TLW config is a feature-flag-off, not a boot failure.)

- [ ] **Step 3: Document them in `apps/backend/.env.example`**

Append:
```dotenv

# TrustlessWork escrow indexing (leave API key / role empty to disable indexing)
TLW_API_KEY=
TLW_NETWORK=testnet
PLATFORM_ROLE_ADDRESS=
# Escrow indexer schedule
ESCROW_INDEX_CRON=*/2 * * * *
```

- [ ] **Step 4: Verify build + boot**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build)
```
Expected: clean. (No boot needed; env defaults keep it bootable.)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260627100000_add_escrow_onchain_state.sql apps/backend/src/config/env.validation.ts apps/backend/.env.example
git commit -m "feat(backend): add escrow on-chain state columns + TLW env (#138)"
```

---

## Task 2: `core/trustless` TLW indexer client

**Files:**
- Create: `apps/backend/src/core/trustless/trustless.config.ts`, `trustless-indexer.service.ts`, `trustless-indexer.service.spec.ts`, `trustless.module.ts`
- Modify: `apps/backend/src/core/core.module.ts`

- [ ] **Step 1: Confirm the TLW REST contract from the SDK dist (authoritative source)**

Run:
```bash
grep -rn "get-escrows-by-role" node_modules/@trustless-work/escrow/dist/*.mjs node_modules/@trustless-work/escrow/dist/index.js | head
# read ~30 lines around one hit to see the exact params object + how baseURL/apiKey/Authorization are set:
sed -n '120,175p' node_modules/@trustless-work/escrow/dist/index.js
grep -rno "https://[a-zA-Z0-9./-]*" node_modules/@trustless-work/escrow/dist/*.mjs | grep -i "trustless\|api" | sort -u
```
Note the exact: query param names (role/roleAddress/type/isActive/page/etc.), the `Authorization: Bearer <apiKey>` header, and the two base URLs (development/mainnet). Use those literal base URLs in Step 2's `BASE_URLS`. If the `role` value for the platform differs from `'platformAddress'`, use what the SDK/docs expect.

- [ ] **Step 2: Create `trustless.config.ts`**

```ts
export type TlwNetwork = 'testnet' | 'mainnet';

// Base URLs confirmed from @trustless-work/escrow dist (Task 2 Step 1).
export const TLW_BASE_URLS: Record<TlwNetwork, string> = {
  testnet: 'REPLACE_WITH_DEVELOPMENT_BASE_URL',
  mainnet: 'REPLACE_WITH_MAINNET_BASE_URL',
};
```
Replace the two strings with the literal URLs extracted in Step 1 (they are deterministic constants, not guesses).

- [ ] **Step 3: Create `trustless-indexer.service.ts`**

```ts
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
import type { Escrow } from '@pacto-p2p/types';
import { TLW_BASE_URLS, type TlwNetwork } from '@core/trustless/trustless.config';

@Injectable()
export class TrustlessIndexerService {
  private readonly logger = new Logger(TrustlessIndexerService.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return (
      !!this.config.get<string>('TLW_API_KEY') &&
      !!this.config.get<string>('PLATFORM_ROLE_ADDRESS')
    );
  }

  async getPlatformEscrows(): Promise<Escrow[]> {
    const apiKey = this.config.get<string>('TLW_API_KEY', '');
    const roleAddress = this.config.get<string>('PLATFORM_ROLE_ADDRESS', '');
    const network = this.config.get<TlwNetwork>('TLW_NETWORK', 'testnet');
    const baseUrl = TLW_BASE_URLS[network] ?? TLW_BASE_URLS.testnet;

    const url = new URL(`${baseUrl}/helper/get-escrows-by-role`);
    url.searchParams.set('role', 'platformAddress');
    url.searchParams.set('roleAddress', roleAddress);
    url.searchParams.set('type', 'single-release');

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      throw new Error(
        `TLW get-escrows-by-role failed: ${res.status} ${res.statusText}`
      );
    }
    const body = (await res.json()) as unknown;
    return Array.isArray(body) ? (body as Escrow[]) : [];
  }
}
```
(Adjust the param names if Step 1 showed different ones. If the response is wrapped, e.g. `{ escrows: [...] }`, unwrap accordingly — match what Step 1 revealed.)

- [ ] **Step 4: Write `trustless-indexer.service.spec.ts`**

```ts
import type { ConfigService } from '@nestjs/config';
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';

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
      new TrustlessIndexerService(cfg({ TLW_API_KEY: 'k', PLATFORM_ROLE_ADDRESS: 'G...' })).isConfigured()
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
      cfg({ TLW_API_KEY: 'secret', PLATFORM_ROLE_ADDRESS: 'GPLATFORM', TLW_NETWORK: 'testnet' })
    );
    const out = await svc.getPlatformEscrows();

    expect(out).toEqual([{ engagementId: 'eng1' }]);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toContain('/helper/get-escrows-by-role');
    expect(String(calledUrl)).toContain('roleAddress=GPLATFORM');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret');
  });

  it('throws on a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests' }) as unknown as typeof fetch;
    const svc = new TrustlessIndexerService(cfg({ TLW_API_KEY: 'k', PLATFORM_ROLE_ADDRESS: 'G' }));
    await expect(svc.getPlatformEscrows()).rejects.toThrow('429');
  });
});
```

- [ ] **Step 5: Run the test**

Run: `cd apps/backend && npm test -- trustless-indexer`
Expected: PASS (3 tests). If `URL`/`fetch` global typing complains under ts-jest, ensure `@types/node` is present (it is) — no code change needed.

- [ ] **Step 6: Create `trustless.module.ts`**

```ts
import { Global, Module } from '@nestjs/common';
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';

@Global()
@Module({
  providers: [TrustlessIndexerService],
  exports: [TrustlessIndexerService],
})
export class TrustlessModule {}
```

- [ ] **Step 7: Import `TrustlessModule` in `apps/backend/src/core/core.module.ts`**

Add `import { TrustlessModule } from '@core/trustless/trustless.module';` and add `TrustlessModule` to the `imports` array (alongside `SupabaseModule`, `HealthModule`).

- [ ] **Step 8: Biome + type-check + build + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/core/trustless apps/backend/src/core/core.module.ts
git commit -m "feat(backend): add TrustlessWork indexer client (#138)"
```

---

## Task 3: Escrow mapper (pure, TDD) + indexer service

**Files:**
- Create: `apps/backend/src/domains/escrow/escrow-mapper.ts`, `escrow-mapper.spec.ts`, `escrow-indexer.service.ts`, `escrow-indexer.service.spec.ts`

- [ ] **Step 1: Write `escrow-mapper.spec.ts` (failing)**

```ts
import { toEscrowPatch } from '@domains/escrow/escrow-mapper';

const NOW = Date.parse('2026-06-26T00:00:00Z');

function escrow(overrides: Record<string, unknown> = {}): any {
  return { engagementId: 'eng1', amount: 100, balance: 0, flags: {}, ...overrides };
}

describe('toEscrowPatch', () => {
  it('maps balance, token_amount and flags', () => {
    const p = toEscrowPatch(escrow({ amount: 250, balance: 250, flags: { disputed: true } }), NOW);
    expect(p.balance).toBe(250);
    expect(p.token_amount).toBe(250);
    expect(p.on_chain_flags).toEqual({ disputed: true });
    expect(p.last_indexed_at).toBe(new Date(NOW).toISOString());
  });

  it('derives on_chain_status by flag precedence then funding', () => {
    expect(toEscrowPatch(escrow({ flags: { resolved: true } }), NOW).on_chain_status).toBe('resolved');
    expect(toEscrowPatch(escrow({ flags: { released: true } }), NOW).on_chain_status).toBe('released');
    expect(toEscrowPatch(escrow({ flags: { disputed: true } }), NOW).on_chain_status).toBe('disputed');
    expect(toEscrowPatch(escrow({ balance: 10, flags: {} }), NOW).on_chain_status).toBe('funded');
    expect(toEscrowPatch(escrow({ balance: 0, flags: {} }), NOW).on_chain_status).toBe('active');
  });

  it('handles missing balance/flags safely', () => {
    const p = toEscrowPatch(escrow({ balance: undefined, flags: undefined }), NOW);
    expect(p.balance).toBe(0);
    expect(p.on_chain_flags).toEqual({});
    expect(p.on_chain_status).toBe('active');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- escrow-mapper`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `escrow-mapper.ts`**

```ts
import type { Escrow } from '@pacto-p2p/types';

export interface EscrowPatch {
  balance: number;
  token_amount: number;
  on_chain_flags: Record<string, boolean>;
  on_chain_status: string;
  last_indexed_at: string;
}

export function toEscrowPatch(escrow: Escrow, now: number): EscrowPatch {
  const flags = (escrow.flags ?? {}) as Record<string, boolean>;
  const balance = Number(escrow.balance ?? 0);
  const tokenAmount = Number(escrow.amount ?? 0);

  let status: string;
  if (flags.resolved) {
    status = 'resolved';
  } else if (flags.released) {
    status = 'released';
  } else if (flags.disputed) {
    status = 'disputed';
  } else if (balance > 0) {
    status = 'funded';
  } else {
    status = 'active';
  }

  return {
    balance: Number.isFinite(balance) ? balance : 0,
    token_amount: Number.isFinite(tokenAmount) ? tokenAmount : 0,
    on_chain_flags: flags,
    on_chain_status: status,
    last_indexed_at: new Date(now).toISOString(),
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- escrow-mapper`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `escrow-indexer.service.spec.ts` (mapping + idempotency)**

```ts
import type { SupabaseService } from '@core/supabase/supabase.service';
import type { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';

function makeSupabase() {
  const updates: Array<{ match: string; payload: any }> = [];
  const client = {
    from() {
      const b: any = {
        _payload: null,
        update(p: any) { b._payload = p; return b; },
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
    ({ isConfigured: () => true, getPlatformEscrows: jest.fn().mockResolvedValue(escrows) }) as unknown as TrustlessIndexerService;

  it('updates each escrow row with the mapped patch (matched by engagement_id)', async () => {
    const { service, updates } = makeSupabase();
    const svc = new EscrowIndexerService(service, indexer([{ engagementId: 'eng1', amount: 100, balance: 100, flags: {} }]));
    const res = await svc.indexAll();
    expect(res.indexed).toBe(1);
    expect(updates[0].match).toBe('eng1');
    expect(updates[0].payload.on_chain_status).toBe('funded');
    expect(updates[0].payload.balance).toBe(100);
  });

  it('no-ops when TLW is not configured', async () => {
    const { service } = makeSupabase();
    const notConfigured = { isConfigured: () => false, getPlatformEscrows: jest.fn() } as unknown as TrustlessIndexerService;
    const res = await new EscrowIndexerService(service, notConfigured).indexAll();
    expect(res.indexed).toBe(0);
  });
});
```

- [ ] **Step 6: Implement `escrow-indexer.service.ts`**

```ts
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { toEscrowPatch } from '@domains/escrow/escrow-mapper';

@Injectable()
export class EscrowIndexerService {
  private readonly logger = new Logger(EscrowIndexerService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly indexer: TrustlessIndexerService
  ) {}

  async indexAll(): Promise<{ indexed: number; unmatched: number }> {
    if (!this.indexer.isConfigured()) {
      this.logger.warn('TLW not configured (TLW_API_KEY/PLATFORM_ROLE_ADDRESS); skipping escrow indexing');
      return { indexed: 0, unmatched: 0 };
    }
    const escrows = await this.indexer.getPlatformEscrows();
    const now = Date.now();
    let indexed = 0;
    let unmatched = 0;
    for (const escrow of escrows) {
      if (!escrow.engagementId) {
        continue;
      }
      const patch = toEscrowPatch(escrow, now);
      const { error } = await this.supabase.client
        .from('escrows')
        .update({ ...patch, updated_at: new Date(now).toISOString() })
        .eq('engagement_id', escrow.engagementId);
      if (error) {
        this.logger.error(`index ${escrow.engagementId} failed: ${error.message}`);
        unmatched += 1;
      } else {
        indexed += 1;
      }
    }
    this.logger.log(`escrow index done indexed=${indexed} unmatched=${unmatched}`);
    return { indexed, unmatched };
  }
}
```
Note: the recording mock in Step 5 resolves the chain at `.eq(...)`. If ts-jest flags the `any` mock, add a file-top `// biome-ignore lint/suspicious/noExplicitAny: test mock` as in phase 2's stats spec — that's a warning, not an error, so it won't block `biome:check`.

- [ ] **Step 7: Run tests**

Run: `cd apps/backend && npm test -- escrow-indexer`
Expected: PASS (2 tests).

- [ ] **Step 8: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/domains/escrow
git commit -m "feat(backend): add escrow mapper + indexer service + tests (#138)"
```

---

## Task 4: Read API + indexer cron + module wiring

**Files:**
- Create: `apps/backend/src/domains/escrow/escrow.service.ts`, `escrow.controller.ts`, `escrow-index.cron.ts`, `escrow.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `escrow.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';

const ESCROW_COLUMNS =
  'id, engagement_id, contract_id, status, fiat_amount, balance, token_amount, on_chain_flags, on_chain_status, last_indexed_at, buyer_id, seller_id, listing_id, created_at, updated_at';

@Injectable()
export class EscrowService {
  constructor(private readonly supabase: SupabaseService) {}

  async getEscrowsForUser(userId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase.client
      .from('escrows')
      .select(ESCROW_COLUMNS)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(`Failed to load escrows for ${userId}: ${error.message}`);
    }
    return data ?? [];
  }
}
```

- [ ] **Step 2: Create `escrow.controller.ts`**

```ts
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EscrowService } from '@domains/escrow/escrow.service';

@ApiTags('escrows')
@Controller()
export class EscrowController {
  constructor(private readonly escrows: EscrowService) {}

  @Get('escrows/users/:id')
  @ApiOperation({ summary: 'Indexed escrow state for a user (buyer or seller).' })
  async forUser(@Param('id', ParseUUIDPipe) id: string) {
    return { escrows: await this.escrows.getEscrowsForUser(id) };
  }
}
```
(Route is `/v1/escrows/users/:id` under URI versioning. A `:id` param keeps it consistent with the stats controller's UUID pattern rather than a query string.)

- [ ] **Step 3: Create `escrow-index.cron.ts`** (same pattern as #137 crons)

```ts
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SchedulerRegistry } from '@nestjs/schedule';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { CronJob } from 'cron';

@Injectable()
export class EscrowIndexCron implements OnModuleInit {
  private readonly logger = new Logger(EscrowIndexCron.name);
  private isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
    private readonly indexer: EscrowIndexerService
  ) {}

  onModuleInit(): void {
    if (!this.config.get<boolean>('CRON_ENABLED', true)) {
      this.logger.log('CRON_ENABLED=false → escrow-index not scheduled');
      return;
    }
    const expr = this.config.get<string>('ESCROW_INDEX_CRON', '*/2 * * * *');
    const job = new CronJob(expr, () => {
      void this.run();
    });
    this.scheduler.addCronJob('escrow-index', job);
    job.start();
    this.logger.log(`escrow-index scheduled: ${expr}`);
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('escrow-index already running; skipping tick');
      return;
    }
    this.isRunning = true;
    const start = Date.now();
    try {
      const res = await this.indexer.indexAll();
      this.logger.log(
        `escrow-index done indexed=${res.indexed} unmatched=${res.unmatched} durationMs=${Date.now() - start}`
      );
    } catch (err) {
      this.logger.error(`escrow-index failed: ${(err as Error).message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
```

- [ ] **Step 4: Create `escrow.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { EscrowController } from '@domains/escrow/escrow.controller';
import { EscrowIndexCron } from '@domains/escrow/escrow-index.cron';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { EscrowService } from '@domains/escrow/escrow.service';

@Module({
  controllers: [EscrowController],
  providers: [EscrowService, EscrowIndexerService, EscrowIndexCron],
})
export class EscrowModule {}
```
(`SupabaseService` and `TrustlessIndexerService` come from the `@Global` `SupabaseModule`/`TrustlessModule`, so no import needed here. `SchedulerRegistry` comes from the global `ScheduleModule`.)

- [ ] **Step 5: Import `EscrowModule` in `apps/backend/src/app.module.ts`**

Add `import { EscrowModule } from '@domains/escrow/escrow.module';` and add `EscrowModule` to the `imports` array (after `PlatformModule`).

- [ ] **Step 6: Build + DI + smoke**

```bash
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build)
grep -n "design:paramtypes" apps/backend/dist/domains/escrow/escrow-index.cron.js apps/backend/dist/domains/escrow/escrow-indexer.service.js
# → reference real classes (ConfigService/SchedulerRegistry/EscrowIndexerService; SupabaseService/TrustlessIndexerService), not [void 0]
( cd apps/backend && node dist/main.js & sleep 2 ; KEY=$(grep '^INTERNAL_API_KEY=' .env | cut -d= -f2) ; \
  echo -n "escrow route no key -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/v1/escrows/users/00000000-0000-0000-0000-000000000000 ; \
  echo -n "escrow route bad uuid -> " ; curl -s -o /dev/null -w "%{http_code}\n" -H "x-internal-key: $KEY" localhost:3001/v1/escrows/users/nope ; \
  kill %1 ) 2>&1 | grep -iE "escrow-index scheduled|escrow route"
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
```
Expected: log `escrow-index scheduled: */2 * * * *`; `no key -> 401`; `bad uuid -> 400`. (With TLW unset the cron run no-ops/logs; that's fine.) Clean up dist.

- [ ] **Step 7: Biome + type-check + full test + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && npm test && cd ../..
npm run type-check
git add apps/backend/src/domains/escrow apps/backend/src/app.module.ts
git commit -m "feat(backend): add escrow read API + indexer cron + wiring (#138)"
```

---

## Task 5: Web — dashboard escrow list reads the backend

**Files:**
- Create: `apps/web/app/api/escrows/route.ts`
- Modify: `apps/web/hooks/use-escrows.ts`

- [ ] **Step 1: Create `apps/web/app/api/escrows/route.ts`**

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const res = await backendFetch(`/v1/escrows/users/${auth.id}`);
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
```

- [ ] **Step 2: Read `apps/web/hooks/use-escrows.ts` and add a backend-list hook**

Read the file to find the dashboard list query (`useEscrowsByRoleQuery`/`useEscrowsBySignerQuery`) and how the dashboard consumes it. Add a NEW hook (do not delete the existing TLW one — keep it for the pre-action/detail flows) that fetches the indexed list from the backend, mirroring `use-user-stats.ts`'s auth-header pattern:

```ts
// apps/web/hooks/use-indexed-escrows.ts  (new)
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useIndexedEscrows(enabled = true) {
  return useQuery({
    queryKey: ['indexed-escrows'],
    enabled,
    staleTime: 15_000,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/escrows', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load escrows');
      const body = (await res.json()) as { escrows: unknown[] };
      return body.escrows;
    },
  });
}
```
(Place this in a new `apps/web/hooks/use-indexed-escrows.ts` to keep `use-escrows.ts` mutation/critical paths untouched.)

- [ ] **Step 3: Point the dashboard escrow LIST at the new hook**

Find the dashboard component that renders the escrow list (search where `useEscrowsByRoleQuery`/`useEscrowsBySignerQuery` results feed the list table, e.g. `app/dashboard/orders` or the escrows tab). Switch the LIST rendering to `useIndexedEscrows()` for display, while leaving any detail/action buttons on the existing live-TLW data. Read the component first; make the minimal swap that renders the backend-served rows in the existing table without changing layout. Report the exact component + the swap.

- [ ] **Step 4: Verify**

```bash
npm run type-check
cd apps/web && npm run build && cd ../..
```
Expected: pass. Runtime (optional, needs backend + TLW env + the migration applied): with the backend indexing real escrows, the dashboard list renders backend-served rows; `/api/escrows` returns `{escrows:[...]}` and `401` without a session.

- [ ] **Step 5: Biome + commit**

```bash
cd apps/web && npx @biomejs/biome check app/api/escrows/route.ts hooks/use-indexed-escrows.ts && cd ../..
git add apps/web/app/api/escrows apps/web/hooks/use-indexed-escrows.ts apps/web/hooks/use-escrows.ts
git commit -m "feat(web): dashboard escrow list reads backend-indexed state (#138)"
```
(Only commit `use-escrows.ts` if Step 3 modified it; otherwise commit the component file you changed instead.)

---

## Task 6: Final verification + PR

- [ ] **Step 1: Full verification**

```bash
cd apps/backend && npm test && npm run biome:check && cd ../..
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
npm run type-check
npm run build
```
Expected: Jest green (mapper, indexer, trustless-indexer, + prior suites); type-check + build pass; backend biome clean.

- [ ] **Step 2: Runtime acceptance (controller applies the migration to dev first)**

Apply `20260627100000_add_escrow_onchain_state.sql` to the dev project. With real `TLW_API_KEY`/`PLATFORM_ROLE_ADDRESS`/`TLW_NETWORK` in `apps/backend/.env`, boot and trigger the indexer (cron tick or temporary direct call). Confirm escrow rows get `balance`/`on_chain_flags`/`on_chain_status`/`last_indexed_at`; a second run is idempotent. `GET /v1/escrows/users/<id>` (with `x-internal-key`) returns the indexed rows.

- [ ] **Step 3: Push + open PR**

```bash
git push -u origin feat/138a-escrow-indexing
gh pr create --repo PACTO-LAT/pacto-p2p --base develop --head feat/138a-escrow-indexing \
  --title "feat(backend): escrow state indexing (phase 4a — #138)" \
  --body "<summary; note 4a=indexing, 4b=sweep to follow; read-only (no signing); stacked on #137; migration applied to dev>"
```
(No `Co-Authored-By`, no "Generated with Claude" footer. Note the branch is stacked on #137 — if #137 isn't merged, the diff includes its commits until it is.)

---

## Self-review checklist (completed during planning)

- **Spec coverage:** migration + env (T1); TLW REST client (T2); pure mapper + indexer upsert (T3); read API + indexer cron + wiring (T4); web read-path consumption (T5); verify+PR (T6). Sweep is explicitly 4b (not here). All 4a spec items covered.
- **Type consistency:** `EscrowPatch` (T3) is produced by `toEscrowPatch` and spread into the `escrows` update in `EscrowIndexerService` (T3) and the cron logs its `{indexed, unmatched}` (T4). `Escrow` from `@pacto-p2p/types` is the input throughout. The read API columns include the new ones from T1's migration.
- **No placeholders:** all code complete EXCEPT the two `TLW_BASE_URLS` strings (T2 Step 2), which are deterministic constants extracted from the SDK dist in T2 Step 1 — not guesses. The web Step 3 swap names the component after reading the file (integration point that must be located in-repo).
- **Known risks:** the exact TLW request params/response wrapper are confirmed from the SDK dist in T2 Step 1 (authoritative); the cron registration is the #137-proven `SchedulerRegistry` pattern; TLW-unconfigured is a logged no-op (feature flag), so boot never fails without TLW creds.
- **Out of scope (per spec):** stuck-escrow sweep (4b), any on-chain write, migrating the web's mutation/pre-action reads, creating DB rows for on-chain-only escrows.
