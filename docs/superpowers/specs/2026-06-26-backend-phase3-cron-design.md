# Backend Phase 3 — Scheduled Jobs / Cron (Issue #137)

**Status:** Design approved (pending spec review)
**Date:** 2026-06-26
**Issue:** [#137 — feat(backend): scheduled cleanup & SLA jobs / cron (phase 3)](https://github.com/PACTO-LAT/pacto-p2p/issues/137)
**Depends on:** #135 (scaffold, merged), #136 (stats pipeline — PR open; this branch is stacked on `feat/136-stats-reputation`).

## Context

This phase adds **cron infrastructure** (`@nestjs/schedule`) to `apps/backend` and the scheduled jobs
that back phase 2's stats and surface stuck disputes. Cron jobs are timer-driven maintenance — no
user action, no user-visible features.

### What the jobs are for
- **Nightly stats reconcile** — phase 2's real-time recompute is best-effort/fire-and-forget; if a
  trigger is missed (network failure, closed tab, the sync path that can't pass both party ids) or
  data is edited directly, the persisted stats drift. A full nightly `recomputeAll()` makes them
  self-heal (eventual correctness).
- **Dispute SLA alert** — a disputed trade freezes funds on-chain until an admin resolves it
  manually; nothing today flags a dispute that has been open too long. This job scans for overdue
  disputes and logs an alert so the team can act.

### Key findings from exploration (shape the design)
- **`access_codes` does not exist** (no migration, not in the remote DB) and **nothing calls**
  `apps/web/app/api/access/verify/route.ts`. The access-code feature is an orphaned stub. → The
  issue's "expired access-code cleanup" job is **dropped from this phase** (nothing to clean); the
  orphan is flagged separately.
- **Disputes are not persisted with a status/timestamp.** Raising a dispute writes
  `escrows.transaction_hashes.dispute` (a tx hash) and inserts a `trade_messages` system row with
  `metadata->>'event' = 'dispute_raised'` (its `created_at` is the only reliable "disputed at"
  timestamp). `escrows.status` stays `'active'` (the enum is `active|cancelled|completed|resolved`;
  there is **no** `'disputed'`). Resolving sets `escrows.status = 'resolved'`. So an **open dispute
  = an escrow still `status='active'` that has a `dispute_raised` system message**.
- `StatsService.recomputeAll()` already exists (phase 2) and is idempotent — the reconcile job calls
  it in-process.
- Jest is already set up (phase 2). `@nestjs/schedule` is not yet installed.

## Decisions (approved)

1. **Two jobs only:** nightly stats reconcile + dispute SLA. **Access-code cleanup deferred** (feature
   doesn't exist); flag the orphaned verify route separately.
2. **Dispute SLA data source:** query the existing data (no migration) — `trade_messages`
   (`dispute_raised`) joined to its `trade_chats` + `escrows`, filtering escrows still `status='active'`
   and message `created_at` older than the threshold.
3. **Alert delivery:** structured pino log only ("minimal at first"); real notifications are phase 5
   (#139). No new table.

## Architecture (extends `domains/platform`)

```
apps/backend/src/domains/platform/
├── disputes/
│   ├── disputes.module.ts
│   ├── disputes.service.ts        # findOverdueDisputes(now, thresholdHours) — query + pure filter
│   └── disputes.service.spec.ts   # overdue-selection unit tests (deterministic)
├── jobs/
│   ├── jobs.module.ts             # imports StatsModule + DisputesModule; declares the two crons
│   ├── stats-reconcile.cron.ts    # @Cron → StatsService.recomputeAll()
│   ├── dispute-sla.cron.ts        # @Cron → DisputesService.findOverdueDisputes() → log
│   └── cron.config.ts             # reads cron schedules/threshold/enabled from ConfigService
platform.module.ts                 # + JobsModule (and DisputesModule via JobsModule)
app.module.ts                      # + ScheduleModule.forRoot()
```

Both `.cron.ts` providers share a small **overlap guard** (a private `isRunning` boolean) so a slow
run can't overlap the next tick, and wrap the work in try/catch that logs and never throws (a failing
job must not crash the process). They use the Nest `Logger`/pino for structured start/finish/error
logs with durations and counts.

## Components

### `cron.config.ts` / env (Joi, all optional with defaults)
| Env | Default | Meaning |
|---|---|---|
| `CRON_ENABLED` | `true` | master switch (set `false` to disable all crons, e.g. on non-primary instances) |
| `RECONCILE_CRON` | `0 3 * * *` | nightly stats reconcile schedule |
| `DISPUTE_SLA_CRON` | `0 * * * *` | dispute SLA scan schedule (hourly) |
| `DISPUTE_SLA_HOURS` | `48` | a dispute open longer than this is "overdue" |

`@Cron` expressions are read via `ConfigService`. When `CRON_ENABLED=false`, each job's handler
early-returns (the decorator still registers, but does nothing) — simplest reliable toggle.

### `stats-reconcile.cron.ts`
`@Cron(RECONCILE_CRON)` handler: overlap-guarded; logs `reconcile.start`; calls
`StatsService.recomputeAll()`; logs `reconcile.done { users, durationMs }`. Errors logged, swallowed.

### `disputes.service.ts`
`findOverdueDisputes(now: number, thresholdHours: number): Promise<OverdueDispute[]>`:
1. Compute `cutoffIso = new Date(now - thresholdHours*3600_000).toISOString()`.
2. Query (service-role): from `trade_messages` where `message_type='system'` and
   `metadata->>'event'='dispute_raised'` and `created_at <= cutoffIso`, embedding
   `trade_chats!inner(escrow_id, buyer_id, seller_id, escrows!inner(status, engagement_id))`.
3. In JS, keep rows whose embedded `escrows.status === 'active'` (i.e. not resolved/cancelled/
   completed) → map to `{ escrowId, engagementId, buyerId, sellerId, disputeRaisedAt, hoursOpen }`.
   (Status is filtered in JS to avoid finicky supabase-js nested-resource filters; volume is low.)

A small pure helper `selectOverdue(rows, now, thresholdHours)` does the status + age mapping and is
unit-tested directly; the service just supplies the DB rows.

### `dispute-sla.cron.ts`
`@Cron(DISPUTE_SLA_CRON)` handler: overlap-guarded; calls `findOverdueDisputes(Date.now(),
DISPUTE_SLA_HOURS)`; for each overdue dispute logs a structured `warn`
`{ event:'dispute_sla_breach', escrowId, engagementId, buyerId, sellerId, hoursOpen }`; logs a summary
`{ overdueCount }`. No DB writes, no external delivery (phase 5).

## Testing (Jest)
- `disputes.service.spec.ts`: unit-test `selectOverdue` (and/or the service with a mocked Supabase
  client like phase 2): given dispute rows raised at various times with escrows in various statuses,
  it returns ONLY `status='active'` disputes older than the threshold, with correct `hoursOpen`;
  `now` is injected for determinism; resolved/cancelled/completed disputes and recent ones are
  excluded.
- The reconcile cron is thin (delegates to the already-tested `StatsService.recomputeAll`); verify by
  build + a runtime smoke (manually invoke the handler or wait for a tick) rather than re-testing
  recompute.

## Verification (end-to-end)
1. `cd apps/backend && npm test` → all suites green (incl. new disputes tests).
2. Root `npm run type-check`, `npm run build`; backend `npm run biome:check` clean.
3. Boot backend; with `CRON_ENABLED=true` and short test schedules (or by invoking handlers directly),
   confirm: reconcile logs `{users, durationMs}` and updates persist; dispute-SLA logs
   `dispute_sla_breach` for seeded overdue disputes and nothing for recent/resolved ones. With
   `CRON_ENABLED=false`, neither job does work.

## Out of scope
- **Access-code cleanup** (orphaned, non-existent feature) — deferred; orphan flagged separately.
- **Robust dispute persistence** (`escrows.dispute_status`/`disputed_at`) — better suited to phase 4
  (escrow indexing, #138); this phase reads existing data.
- **Real alert delivery** (email/in-app) — phase 5 (#139); this phase logs only.
- **Multi-instance cron coordination** (distributed lock) — single-instance assumption; `CRON_ENABLED`
  lets you disable crons on extra instances. Revisit if the backend scales horizontally.
- **`listings`/`waitlist_submissions` RLS disabled** — a separate security finding surfaced during
  exploration; tracked outside this issue.
