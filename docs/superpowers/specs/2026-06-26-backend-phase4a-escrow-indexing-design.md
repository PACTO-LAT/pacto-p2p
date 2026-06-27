# Backend Phase 4a — Escrow State Indexing (Issue #138, part 1 of 2)

**Status:** Design approved (pending spec review)
**Date:** 2026-06-26
**Issue:** [#138 — feat(backend): escrow indexing + stuck-escrow sweep (phase 4)](https://github.com/PACTO-LAT/pacto-p2p/issues/138)
**Depends on:** #135 (scaffold), #136 (stats, merged), #137 (cron — stacked; this branch is on `feat/137-cron-jobs` for `ScheduleModule`).

## Scope split

#138 is large, so it's split: **4a (this spec) = escrow state indexing**; **4b (separate) = stuck-escrow sweep** (auto DB-cancel unfunded escrows past the grace period + log — it depends on the `balance` 4a persists).

## Context

On-chain escrow state (balance, flags, milestones, roles) is read **per-client** from the
TrustlessWork (TLW) indexer on every dashboard load (`apps/web/hooks/use-escrows.ts`,
`validateOnChain`), which is slow and rate-limit-prone (#107). This phase has the backend **poll
the TLW indexer, persist escrow state to Supabase, and serve it**, so the web can read cached
state instead of calling TLW per-client.

### Findings from exploration (shape the design)
- **TLW indexer is a plain REST API callable from Node:** the `@trustless-work/escrow` SDK is
  React-hooks-only, but its reads are `GET {baseURL}/helper/get-escrows-by-role` (and
  `…-by-signer`) with header `Authorization: Bearer {apiKey}`; `baseURL` is the SDK's
  `development`/`mainNet` constant. So the backend calls TLW directly via HTTP (no React, no
  wallet) for reads.
- **The backend cannot sign transactions** — no server-side Stellar secret key; all signing is
  client-side (StellarWalletsKit). So indexing is **read-only**; any on-chain write
  (fund/release/dispute/cancel-on-chain) is out of scope forever. (The sweep in 4b is DB-only,
  which is how the existing manual cancel already works — `TradesService.cancelUnfundedEscrow`.)
- **`escrows` table** persists only `engagement_id`, `contract_id`, `status`
  (active|cancelled|completed|resolved), `transaction_hashes`, `cancelled_at`, `fiat_amount`,
  `buyer_id`/`seller_id`, `listing_id`. The rich on-chain shape (`balance`, `flags`, `milestones`,
  `roles`, token `amount`) is **only read live from TLW** — not persisted.
- The web already persists escrow rows on creation and recovers orphans / syncs completion
  (#102/#107/#108 merged). 4a adds the **rich on-chain state** on top.
- The shared `Escrow` type lives in `packages/types/src/Escrow.ts` (fields: `engagementId`,
  `contractId`, `roles`, `amount`, `balance`, `milestones`, `flags` {disputed/released/resolved/
  approved}, `isActive`, `createdAt {_seconds,_nanoseconds}`, …).

## Decisions (approved)

1. **Split**: 4a indexing now; 4b sweep later.
2. **Backend pulls from TLW directly** via the REST indexer (read-only, API key).
3. **Web rewiring (safe path):** the dashboard escrow **list/read** consumes the backend-served
   cached state; the **pre-action critical reads** (`validateOnChain=true` before deposit/release/
   dispute) and **all mutations** stay on the live client-side TLW path, untouched. (No users yet;
   goal is that it demonstrably works without risking the money flow.)
4. **Sweep action (4b):** auto DB-cancel unfunded-past-grace escrows + log.

## Architecture

```
apps/backend/src/
├── core/trustless/
│   ├── trustless.module.ts
│   ├── trustless.config.ts          # baseURL from TLW_NETWORK, apiKey, platform role address
│   └── trustless-indexer.service.ts # GET /helper/get-escrows-by-role (axios), returns Escrow[]
└── domains/escrow/
    ├── escrow.module.ts             # imported by app.module (new domain context)
    ├── escrow-mapper.ts             # PURE: Escrow (on-chain) → DB column patch
    ├── escrow-mapper.spec.ts
    ├── escrow-indexer.service.ts    # fetch via TrustlessIndexerService → upsert escrows rows
    ├── escrow.service.ts            # read API queries (getEscrowsForUser)
    ├── escrow.controller.ts         # GET /v1/escrows... (InternalApiKeyGuard)
    ├── escrow-index.cron.ts         # SchedulerRegistry cron → indexer.indexAll()
    └── dto/
```
`app.module.ts` imports the new `EscrowModule` (and `EscrowModule` imports `core/trustless`). `core/trustless` is registered in `CoreModule` (it's infrastructure). `ScheduleModule` already exists (#137).

> Note: `domains/escrow` is a new bounded context (escrow lifecycle), distinct from `domains/platform` (stats/jobs). The escrow-index cron lives in the escrow domain (cohesion) but reuses the same `SchedulerRegistry` pattern as #137.

## Components

### `core/trustless` (infra)
- **`trustless.config.ts`**: reads `TLW_API_KEY`, `TLW_NETWORK` (testnet→`development` base URL,
  mainnet→`mainNet`), `PLATFORM_ROLE_ADDRESS`. The two base URLs are imported from
  `@trustless-work/escrow` (`development`/`mainNet` constants) or hardcoded if not importable
  from Node — verify at implementation.
- **`trustless-indexer.service.ts`**: `getPlatformEscrows(): Promise<Escrow[]>` →
  `axios.get(\`${baseURL}/helper/get-escrows-by-role\`, { headers: { Authorization: \`Bearer ${apiKey}\` }, params: { role: 'platformAddress', roleAddress: PLATFORM_ROLE_ADDRESS, type: 'single-release', isActive: true, …pagination } })`. Handles 429 with bounded backoff (mirror the web's retry).

### `domains/escrow`
- **`escrow-mapper.ts`** (pure): `toEscrowPatch(escrow: Escrow)` → `{ balance, token_amount,
  on_chain_flags, on_chain_status, last_indexed_at }`. `on_chain_status` derived from flags
  (`resolved`→'resolved', `released`→'released', `disputed`→'disputed', balance>0→'funded',
  else 'active'). Unit-tested.
- **`escrow-indexer.service.ts`**: `indexAll()` → `getPlatformEscrows()` → for each, `update`
  the `escrows` row (matched by `engagement_id`) with `toEscrowPatch(...)`. Idempotent (overwrites
  from source). Logs counts. Escrows present on-chain but not in DB are skipped (the web's
  recover-orphans handles creation; 4a only enriches existing rows) — or optionally upserts a
  minimal row; default: enrich existing only, log unmatched count.
- **`escrow.service.ts`**: `getEscrowsForUser(userId)` → select indexed `escrows` rows where
  `buyer_id=userId OR seller_id=userId`, returning the persisted on-chain state.
- **`escrow.controller.ts`**: `GET /v1/escrows/me?userId=<uuid>` (ParseUUIDPipe), behind the
  global `InternalApiKeyGuard`. Returns the indexed rows.
- **`escrow-index.cron.ts`**: registers via `SchedulerRegistry` in `onModuleInit` using
  `ESCROW_INDEX_CRON` (default `*/2 * * * *`), `CRON_ENABLED`-gated, overlap-guarded, never-throws
  — same pattern as #137's crons.

### Migration
`supabase/migrations/<ts>_add_escrow_onchain_state.sql`:
```sql
ALTER TABLE escrows
  ADD COLUMN IF NOT EXISTS balance NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS token_amount NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS on_chain_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS on_chain_status TEXT,
  ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_escrows_last_indexed_at ON escrows(last_indexed_at);
```
Applied to the dev project (confirm before backend writes these columns).

### Web (safe read path)
- **`apps/web/app/api/escrows/route.ts`** (GET, `requireUser`) → `backendFetch('/v1/escrows/me?userId=<id>')` → returns the indexed escrow rows.
- The **dashboard escrow list** consumes this (a hook/read) for display, instead of the live
  per-client TLW call. The escrow **detail / pre-action** flows keep `validateOnChain=true` live
  reads, and all mutations are unchanged. Exact wiring point chosen during planning by reading
  `use-escrows.ts` (the list query vs the action paths).

### Env (backend)
`TLW_API_KEY` (required if indexing enabled), `TLW_NETWORK` (`testnet`|`mainnet`, default
`testnet`), `PLATFORM_ROLE_ADDRESS` (required), `ESCROW_INDEX_CRON` (default `*/2 * * * *`). Joi +
`.env.example`. To avoid hard-failing boot when TLW isn't configured, the indexer cron logs and
no-ops if `TLW_API_KEY`/`PLATFORM_ROLE_ADDRESS` are unset (feature-flag style), rather than the
config being `.required()`.

## Testing
- `escrow-mapper.spec.ts` (pure): flag/balance → `on_chain_status` derivation; field mapping;
  edge cases (no flags, balance 0/>0).
- `trustless-indexer.service.spec.ts`: with axios mocked, asserts the correct URL/path, `Bearer`
  auth header, params, and that the response is returned/parsed; 429 retry path.
- `escrow-indexer.service.spec.ts`: with mocked indexer + Supabase, asserts each escrow row is
  updated with the mapped patch and that a second run is idempotent.

## Verification (end-to-end)
1. Apply the migration to the dev project.
2. `cd apps/backend && npm test` green; root `type-check`/`build`; backend `biome:check` clean.
3. With real `TLW_API_KEY`/`PLATFORM_ROLE_ADDRESS`/`TLW_NETWORK` in `apps/backend/.env`, boot and
   invoke the indexer (cron tick or a temporary direct call): escrow rows get `balance`/
   `on_chain_flags`/`on_chain_status`/`last_indexed_at` populated; running twice is idempotent.
4. `GET /v1/escrows/me?userId=<id>` (with `x-internal-key`) returns the indexed state.
5. Web: the dashboard escrow list renders from `/api/escrows` (backend-served).

## Out of scope (4a)
- **Stuck-escrow sweep** → 4b (auto DB-cancel unfunded past grace + log).
- Any on-chain write from the backend (no signing key) — permanent.
- Migrating the web's mutation flows or pre-action `validateOnChain` reads.
- Indexing escrows that exist on-chain but have no DB row (web's recover-orphans owns creation; 4a
  enriches existing rows, logging unmatched).
- `listings`/`waitlist_submissions` RLS finding (separate security issue).
