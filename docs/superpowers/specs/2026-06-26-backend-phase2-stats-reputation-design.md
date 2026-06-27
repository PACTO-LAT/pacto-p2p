# Backend Phase 2 — Merchant/User Stats + Reputation + Read API (Issue #136)

**Status:** Design approved (pending spec review)
**Date:** 2026-06-26
**Issue:** [#136 — feat(backend): merchant/user stats + reputation + read API (phase 2)](https://github.com/PACTO-LAT/pacto-p2p/issues/136)
**Depends on:** #135 (backend scaffold, merged to `develop`)

## Context

Stats columns are read in the UI but never written, so they stay at 0:
- `merchants.rating`, `merchants.total_trades`, `merchants.volume_traded`
- `users.reputation_score`, `users.total_trades`, `users.total_volume` (shown in
  `apps/web/components/profile/ProfileStats.tsx` via `useAuth`)

This phase makes the `apps/backend` (NestJS) compute, persist, and serve them, and switches
the web profile/merchant pages to read the core stats from the backend API. This is the
original motivation for standing up the backend.

### Current data model (verified from `supabase/migrations/`)

- **`merchants`**: `rating NUMERIC(3,2)` (0–5), `total_trades INT`, `volume_traded NUMERIC(20,7)`, `user_id → users.id`, `is_public`. **No** completion/dispute columns yet.
- **`users`**: `reputation_score NUMERIC(5,2)` (0–5), `total_trades INT`, `total_volume NUMERIC(20,7)`, `id → auth.users.id`.
- **`trades`**: `status` ∈ {pending, completed, failed, cancelled, disputed, resolved}; `buyer_id`, `seller_id` (both → users), `fiat_amount NUMERIC(20,2)`, `fiat_currency`, `token_amount`, `completed_at`, `listing_id`, `escrow_id`.
- **`escrows`**: `status` ∈ {active, cancelled, completed, resolved}, `fiat_amount`, `buyer_id`, `seller_id`. No separate `disputes` table — a dispute is a trade status.
- Trade completion is written in `apps/web/hooks/use-trades.ts` (`releaseFunds` → `trades.status='completed'`, `completed_at`) and `TradesService.syncCompletedStatus`. Disputes via `disputeEscrow`.
- Merchant KPIs/badges/charts are currently computed **client-side** in `apps/web/lib/adapters/merchant.supabase.ts` (`getKpis/getBadges/getVolumeSeries/getSpeedHistogram`). User stats come from the `users` columns via `AuthService.getUserProfile`.
- Web→backend plumbing already exists: `BACKEND_URL` + `INTERNAL_API_KEY` (server-side), guard validates the `x-internal-key` header (#135).

## Decisions (approved)

1. **Aggregation trigger:** the web triggers a recompute after it marks a trade
   completed/disputed; the backend recomputes the affected entities **from source** and
   persists. Plus an internal `recompute-all` endpoint (idempotent; reused by the Phase 3
   nightly cron). No Supabase DB-webhook infra in this phase (documented as future hardening).
2. **completion/dispute %:** add `merchants.completion_rate` and `merchants.dispute_rate`
   columns via a Supabase migration and persist them (the issue asks to persist these).
3. **Web read scope:** core stats + reputation only — user `{reputation_score, total_trades,
   total_volume}` and merchant `{rating, total_trades, volume_traded, completion_rate,
   dispute_rate}`. The existing client-side charts (volume-series, speed-histogram, badges)
   stay as-is (out of the Phase 2 issue's scope).
4. **Testing:** add a minimal Jest setup to `apps/backend` for the pure reputation engine and
   a stats idempotency test (the idempotency AC is verifiable; the engine is pure logic).

## Architecture (first `domains/` bounded context: `platform`)

```
apps/backend/src/domains/platform/
├── platform.module.ts            # aggregator → ReputationModule, StatsModule (imported by app.module)
├── reputation/
│   ├── reputation.module.ts
│   ├── reputation.config.ts      # reads weights from ConfigService (env, with defaults)
│   ├── reputation.service.ts     # PURE scoring engine
│   └── reputation.service.spec.ts
└── stats/
    ├── stats.module.ts
    ├── stats.service.ts          # recompute from trades/escrows + persist; uses ReputationService + SupabaseService
    ├── stats.service.spec.ts     # idempotency + mapping
    ├── stats.controller.ts       # read API (GET) + internal recompute (POST)
    └── dto/
        ├── recompute.dto.ts      # { userIds: string[] }
        ├── user-stats.dto.ts     # response shape
        └── merchant-stats.dto.ts # response shape
```

`PlatformModule` is added to `app.module.ts` `imports` (the first domain context). No changes
to `main.ts`.

## Reputation engine (configurable; 0–5)

Same engine for `users.reputation_score` and `merchants.rating`, applied over **different trade
sets** (excluding self-trades `buyer_id === seller_id` and zero-amount trades):

- **User** (`users.reputation_score`): trades where the user is **buyer OR seller** — reputation
  reflects all of the user's trading activity in either role.
- **Merchant** (`merchants.rating` + rates): trades where the merchant's user is the **seller
  only** — a merchant's rating reflects their selling track record. This aligns with the
  documented intent in #106 (`COUNT WHERE seller_id = merchantUserId`). As a result a merchant's
  `rating` can legitimately differ from the underlying user's `reputation_score`.

Inputs per trade set:

```
C = #completed,  D = #(disputed|resolved),  X = #(cancelled|failed),  F = C+D+X
completion_rate = F>0 ? C/F : 0        (persisted as percent 0–100)
dispute_rate    = F>0 ? D/F : 0        (persisted as percent 0–100)
V = Σ fiat_amount over completed trades

q      = clamp(W_C·completion_rate − W_D·dispute_rate, 0, 1)     # ratios in [0,1] here
conf   = C / (C + K)                                             # sample smoothing
q_adj  = conf·q + (1−conf)·Q_NEUTRAL
if daysSinceLastCompleted > RECENCY_DAYS: q_adj *= DECAY         # no completed trade ⇒ no decay applied
vbonus = V_WEIGHT · min(1, ln(1+V) / ln(1+V_SAT))
score  = round(clamp(q_adj + vbonus, 0, 1) · 5, 2)
```

**Configurable params** (env, all optional with defaults; validated in `config/env.validation.ts`):

| Env | Default | Meaning |
|---|---|---|
| `REPUTATION_W_COMPLETION` | 1.0 | completion-rate weight |
| `REPUTATION_W_DISPUTE` | 1.5 | dispute-rate penalty (disputes hurt more) |
| `REPUTATION_SMOOTHING_K` | 8 | Bayesian sample smoothing constant |
| `REPUTATION_NEUTRAL` | 0.6 | neutral quality prior (≈ 3.0/5) |
| `REPUTATION_RECENCY_DAYS` | 90 | inactivity window before decay |
| `REPUTATION_DECAY` | 0.9 | decay multiplier when inactive |
| `REPUTATION_VOLUME_WEIGHT` | 0.05 | max volume bonus (small) |
| `REPUTATION_VOLUME_SAT` | 10000 | volume saturation point for the log bonus |

**Anti-gaming (documented):** `conf` shrink prevents a few perfect trades from reaching 5★;
disputes weigh more than completions; volume is logarithmic + capped with a tiny weight (you
can't buy reputation); self-trades and zero-amount trades are excluded. (A distinct-counterparty
requirement is a possible future hardening.)

`reputation.service.ts` exposes a pure function:
`score(input: { completed; disputed; cancelledFailed; volume; daysSinceLastCompleted | null }): number`
plus the `completion_rate`/`dispute_rate` percentages are computed in `stats.service.ts` (or a
shared helper) so both the score and the persisted rates use one definition.

## StatsService (recompute = full, from source ⇒ idempotent)

- `recomputeForUser(userId)`:
  1. Load trades where `buyer_id = userId OR seller_id = userId` (exclude self-trades, zero amounts).
  2. `total_trades = C` (completed count), `total_volume = Σ fiat_amount(completed)`.
  3. `reputation_score = ReputationService.score(...)`.
  4. `UPDATE users SET reputation_score, total_trades, total_volume, updated_at`.
  5. If a merchant row exists for `userId`, recompute it over the **seller-only** trade set
     (trades where `seller_id = userId`): `rating` (same engine), `total_trades`,
     `volume_traded`, `completion_rate`, `dispute_rate` → `UPDATE merchants`.
- `recomputeForUsers(userIds[])`: loop (dedup).
- `recomputeAll()`: page through all users, `recomputeForUser` each (covers merchants). Used by
  the Phase 3 nightly cron later.

All reads use the service-role `SupabaseService` client (bypasses RLS). Recompute is always a
full recompute from `trades`, so running it once or N times yields identical values
(idempotency AC).

## Read + internal API (versioned `/v1`, behind `InternalApiKeyGuard`)

The web calls these server-side with `x-internal-key`, so they stay internal (not public).

- `GET /v1/users/:id/stats` → `{ reputation_score, total_trades, total_volume }`
- `GET /v1/merchants/:id/stats` → `{ rating, total_trades, volume_traded, completion_rate, dispute_rate }`
- `POST /v1/internal/stats/recompute` body `{ userIds: string[] }` → recompute those users (+ their merchants). Returns the recomputed summaries.
- `POST /v1/internal/stats/recompute-all` → recompute everything (idempotent).

DTOs use `class-validator` (the global `ValidationPipe` enforces `whitelist`/`forbidNonWhitelisted`);
controllers carry `@ApiTags`/`@ApiOperation` for Swagger at `/docs`. The read endpoints return
`404` for unknown ids (mapped by the existing exception filter).

## Database migration

`supabase/migrations/<timestamp>_add_merchant_rate_columns.sql`:

```sql
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (completion_rate >= 0 AND completion_rate <= 100),
  ADD COLUMN IF NOT EXISTS dispute_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (dispute_rate >= 0 AND dispute_rate <= 100);
```

Percent (0–100), matching the existing `*_pct` semantics the UI uses.

## Web integration (core stats only)

The `INTERNAL_API_KEY` is server-side only, so the browser never holds it — all backend calls
go through Next.js server routes / server components.

- **`apps/web/lib/services/backend.ts`** (new): a tiny server-only helper
  `backendFetch(path, init)` that prepends `BACKEND_URL` and sets the `x-internal-key` header
  (throws if env missing). One place for the secret.
- **`app/api/stats/me/route.ts`** (GET, `requireAuth`): resolves the current user id from the
  Supabase session, calls `backendFetch('/v1/users/:id/stats')`, returns JSON.
  `ProfileStats` consumes it via a new client hook (e.g. `useUserStats`) instead of reading the
  `users` columns directly.
- **`app/api/stats/recompute/route.ts`** (POST, `requireAuth`): validates the caller is a party
  to the affected ids, forwards `{ userIds }` to `backendFetch('/v1/internal/stats/recompute')`.
- **`apps/web/hooks/use-trades.ts`**: after `releaseFunds` marks the trade completed (and after
  a dispute), fire-and-log a `POST /api/stats/recompute` with `{ userIds: [buyer_id, seller_id] }`.
  Failure must not break the trade flow (best-effort; the nightly reconcile is the backstop).
- **`app/m/[slug]/page.tsx`** (server component): fetch `/v1/merchants/:id/stats` via
  `backendFetch` for the core numbers (rating, total_trades, volume_traded, completion_rate,
  dispute_rate). Charts/badges keep their current client-side computation.
- **Seller-only consistency for the client charts:** the client-side `getKpis`/`getVolumeSeries`/
  `getSpeedHistogram` in `apps/web/lib/adapters/merchant.supabase.ts` currently filter trades by
  `buyer OR seller`. Change that filter to **seller-only** (`seller_id = merchant.user_id`) — a
  one-line definitional fix so the page's chart metrics match the backend's seller-only
  completion/dispute rates and align with #106's intent. (This is a filter alignment, not the
  out-of-scope move of chart computation to the backend.)

The persisted columns remain the source of truth; the read API is a thin read over them, so the
web "reads from the backend API" (AC) while staying consistent with what the backend writes.

## Configuration / env additions

`apps/backend`: the 8 `REPUTATION_*` vars (optional, defaulted) added to
`config/env.validation.ts` (Joi) and `apps/backend/.env.example`. No new web env vars
(`BACKEND_URL` + `INTERNAL_API_KEY` already exist).

## Testing

Add minimal Jest to `apps/backend` (`jest`, `ts-jest`, `@types/jest`; `test` script;
`jest.config`). Tests:
- `reputation.service.spec.ts`: 0 trades → neutral (~3.0); high completion/low dispute → high;
  high dispute → low; few samples shrink toward neutral; inactivity decay; volume bonus capped.
- `stats.service.spec.ts`: with a mocked Supabase client, `recomputeForUser` maps trades →
  persisted values, and running it twice yields identical updates (idempotency).

Manual/runtime verification: see below. (Jest is wired into the backend's own `test` script;
turbo-root wiring of a `test` task is optional and noted, not required for the existing green
scripts.)

## Acceptance criteria → coverage

- Completing a trade updates `merchants.*`/`users.*` (no longer 0) → web trigger + `recomputeForUser`.
- Full recompute converges (idempotent) → full-from-source recompute + idempotency test.
- `rating`/`reputation_score` from a documented, configurable model → reputation engine + this spec.
- Web profile/merchant pages read stats from the backend API → `/api/stats/me`, merchant page `backendFetch`.

## Verification (end-to-end)

1. Apply the migration locally (`npm run db:reset` or `supabase migration up`), regenerate types if applicable.
2. Root `npm run type-check`, `npm run build`; backend `npm run biome:check` (clean) and `npm test` (Jest passes).
3. Boot backend (`npm run dev:backend`), with a real `SUPABASE_SERVICE_ROLE_KEY` + `INTERNAL_API_KEY`:
   - `curl -H "x-internal-key: $KEY" -X POST localhost:3001/v1/internal/stats/recompute-all` → 200.
   - `curl -H "x-internal-key: $KEY" localhost:3001/v1/users/<id>/stats` → reflects that user's completed trades.
   - Run recompute twice → identical values (idempotency).
4. In the web app: complete a trade → `users`/`merchants` rows update; `ProfileStats` and the
   merchant page show non-zero values fetched from the backend.

## Out of scope

- **Multi-currency (FX) normalization of `fiat_amount`** — summed as-is across currencies,
  mirroring current behavior. **No issue tracks this today**, and #144 will *add* more fiat
  currencies (BRL/COP/ARS) — so `volume_traded`/`total_volume` mix currencies and the problem
  grows. Tracked in **#149** (feat(stats): normalize multi-currency `fiat_amount`); this phase
  does not attempt it. #142 only removes the CRCX/MXNX *tokens*, not fiat currencies.
- Moving the client-side charts (volume-series/speed/badges) to the backend — they already
  compute from real trades (#106/#102, closed). This phase only **aligns their trade filter to
  seller-only**, not their location.
- The nightly reconcile **schedule** (Phase 3, #137) — this phase provides the `recompute-all`
  endpoint it will call. No Supabase DB-webhook/queue is added (web-triggered + nightly reconcile
  is the chosen mechanism); a DB webhook is a possible future hardening with no issue today.
- Reputation-model refinements not in this engine (distinct-counterparty anti-gaming, continuous
  time-decay, hard minimum-sample cutoff) — no issue tracks these; future hardening.
- Removing the denormalized columns vs compute-on-read (revisit later).

### Suggested new issue — FX normalization for volume metrics

> **Title:** feat(stats): normalize multi-currency `fiat_amount` for volume/reputation metrics
>
> **Context:** `trades.fiat_amount` is denominated in `trades.fiat_currency` (CRC, MXN, and —
> after #144 — BRL/COP/ARS). The Phase 2 stats pipeline (#136) and the legacy client KPIs sum
> `fiat_amount` across currencies without conversion, so `merchants.volume_traded`,
> `users.total_volume`, and the volume component of reputation mix currencies and are not
> comparable. #142 removes CRCX/MXNX tokens but explicitly leaves fiat codes as-is.
>
> **Scope:** introduce an FX source (table or provider) and a canonical reporting currency
> (e.g. USD); convert `fiat_amount → fiat_amount_usd` at trade-completion time (persisted) or in
> the stats recompute; update the recompute pipeline and read API to report normalized volume;
> backfill existing rows. Decide persisted-converted-column vs on-the-fly conversion.
>
> **Acceptance:** volume metrics are expressed in one currency; a recompute over mixed-currency
> trades yields comparable totals; documented FX source + as-of semantics.
