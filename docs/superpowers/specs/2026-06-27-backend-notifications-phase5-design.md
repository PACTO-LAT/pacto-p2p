# Backend Phase 5 — Notification Service (Issue #139)

**Status:** Design approved (pending spec review)
**Date:** 2026-06-27
**Issue:** [#139 — feat(backend): notification service (phase 5)](https://github.com/PACTO-LAT/pacto-p2p/issues/139)
**Depends on:** #135 (scaffold), #136 (stats, merged), #137 (cron — stacked), #138a (escrow indexing — this branch is on `feat/138a-escrow-indexing`, provides the escrow state the events derive from).

## Context

The backend (`apps/backend`) now indexes on-chain escrow state (#138a) but **notifies users of
nothing** when an escrow changes state. Notification *types* and per-user preference toggles already
exist in the web (`apps/web/lib/types.ts`, `components/profile/NotificationSettings.tsx`,
`users.notifications` JSONB column) but there is **no sender and no persistence** — the only emails
sent today are waitlist OTPs from `apps/web`.

This phase adds a backend **notification service**: when the escrow indexer detects a state
transition, it **persists in-app notification rows** and (optionally) sends an email. v1 fires on
**escrow released** only.

### Findings from exploration (shape the design)
- **`users.notifications` JSONB** shape (canonical): `{ email_trades, email_escrows,
  push_notifications, sms_notifications }`; defaults `email_*`/`push` = true, `sms` = false. Loose
  legacy variants exist in seed data (`{ email, push }`) — the web normalizes via
  `apps/web/lib/utils/normalize-user.ts` `normalizeNotifications()`. There is **no `notifications`
  table** yet (only the prefs column).
- **`escrows` table already has `buyer_id` and `seller_id`** (both UUID FK → `users`), so mapping an
  escrow to the users to notify is direct — no wallet-address resolution. `users.email` and
  `users.full_name` provide the email recipient and display name.
- **Resend** is used only in `apps/web` (`resend@^4.8.0`, env `RESEND_API_KEY`, sender
  `Pacto <no-reply@pacto.app>`). The backend has **no Resend dependency yet**; the phase-1 scaffold
  spec already earmarked `core/email` (Resend) for #139. Resend's free tier is 100 emails/day /
  3,000/month — no cost at current (pre-launch) volume.
- **`docs/email-templates/`** contains only a README for Supabase **Auth** templates — no
  transactional templates. Our transactional emails live as typed TS render functions, not files.
- **The escrow indexer does a blind upsert** (`escrow-indexer.service.ts` lines 28–45): it overwrites
  each row with the latest `toEscrowPatch(...)` and **does not compare old vs new**. There is **no
  EventEmitter/queue** in the backend (`@nestjs/event-emitter` is not a dependency). Transition
  detection must be **added**.
- **`on_chain_status`** is derived by `escrow-mapper.ts` from flags/balance:
  `resolved` → `released` → `disputed` → (`balance>0`) `funded` → else `active`.

## Decisions (approved)

1. **In-app first, email off by flag.** Persist notifications to a new `notifications` table ($0,
   no external service). The **email channel is implemented but disabled** by feature flag
   (`RESEND_API_KEY` empty default — the repo's standard for optional integrations). Enabling email
   later is just setting the key — no rework.
2. **v1 event = escrow `→released` only**, notifying **both parties** (buyer + seller). The system is
   event-driven and extensible — adding `funded`/`disputed`/`resolved` is a mapping addition.
3. **Backend-only.** Table + write-on-transition + read API. Web UI (bell/feed) is a separate
   frontend issue; the web will consume the read API server-side (`backendFetch` + `requireUser`).
4. **`resend` npm package** (parity with web) for the email channel; **inline send** (await after
   creating the row) — **no retry cron** for now (`email_status='failed'` rows are the seam for a
   future retry job).

## Architecture

```
apps/backend/src/
├── core/email/
│   ├── email.module.ts          # @Global, exports EmailService
│   ├── email.config.ts          # reads RESEND_API_KEY, EMAIL_FROM
│   ├── email.service.ts         # isEnabled() + send(); no-op (skipped) when disabled
│   ├── email.service.spec.ts
│   └── templates/
│       ├── escrow-released.template.ts   # renderEscrowReleasedEmail(data) → {subject, html, text}
│       └── escrow-released.template.spec.ts
└── domains/notifications/
    ├── notifications.module.ts   # imported by EscrowModule; imports nothing escrow-side (one-way)
    ├── notifications.service.ts  # onEscrowReleased(...) → insert rows + (maybe) email
    ├── notifications.service.spec.ts
    ├── notifications.controller.ts   # GET/PATCH /v1/notifications... (InternalApiKeyGuard)
    ├── notification-prefs.ts     # PURE: normalizeNotifications(jsonb) (ported from web)
    ├── notification-prefs.spec.ts
    ├── notification-builder.ts   # PURE: buildReleasedNotifications(escrowRow) → NotificationDraft[]
    ├── notification-builder.spec.ts
    ├── escrow-transition.ts      # PURE: detectEscrowTransition(old, new) → TransitionEvent | null
    ├── escrow-transition.spec.ts
    └── notifications.types.ts
```
`EscrowModule` imports `NotificationsModule` (one-way Escrow → Notifications; clean boundaries —
Notifications does not depend on Escrow). `EmailModule` is registered `@Global` in `CoreModule`
(infrastructure). `app.module.ts` already imports `EscrowModule`.

## Components

### `core/email` (infra, disabled by default)
- **`email.config.ts`**: reads `RESEND_API_KEY` (empty → disabled) and `EMAIL_FROM`
  (default `Pacto <no-reply@pacto.app>`).
- **`email.service.ts`**: `isEnabled(): boolean` (key present). `send({ to, subject, html, text }):
  Promise<{ status: 'sent' | 'failed' | 'skipped' }>` — if disabled returns `{ skipped }` **without
  constructing the Resend client or making any network call**; if enabled, sends via the `resend`
  package and maps success/error. Never throws to the caller (logs on failure, returns `failed`).
- **`templates/escrow-released.template.ts`** (pure): `renderEscrowReleasedEmail(data)` →
  `{ subject, html, text }`, role-aware copy (buyer vs seller). Unit-tested.

### `domains/notifications`
- **`escrow-transition.ts`** (pure): `detectEscrowTransition(oldStatus: string | null, newStatus:
  string): TransitionEvent | null`. Returns `{ kind: 'escrow_released' }` only when
  `oldStatus != null && oldStatus !== 'released' && newStatus === 'released'`. **Anti-backfill
  guard:** `oldStatus == null` (never indexed) → returns `null` (baseline). Extensible: future
  transitions add cases here. Unit-tested across the status matrix.
- **`notification-prefs.ts`** (pure): `normalizeNotifications(value: unknown): NotificationPrefs`,
  ported from `apps/web/lib/utils/normalize-user.ts` (handles canonical + legacy `{email,push}` +
  defaults). Unit-tested.
- **`notification-builder.ts`** (pure): `buildReleasedNotifications(escrow): NotificationDraft[]` —
  returns two drafts (buyer + seller) with `type:'escrow_released'`, role-aware `title`/`body`, and
  `data` (`engagement_id`, amount, counterparty, role). Unit-tested.
- **`notifications.service.ts`**: `onEscrowReleased(input: { escrowId, buyerId, sellerId,
  engagementId, amount, ... })`:
  1. `buildReleasedNotifications(...)` → 2 drafts.
  2. For each draft: **insert the in-app row** (`insert ... onConflict (user_id,type,escrow_id) do
     nothing`). The in-app row is **always** created (not gated by email prefs).
  3. Determine email: load the recipient's `users.notifications` + `email`, run
     `normalizeNotifications`; email is sent only if `email_escrows === true` **and**
     `EmailService.isEnabled()`. Render template, `EmailService.send(...)`, set `email_status` ←
     `sent` | `failed` | `skipped` (skipped when pref off or channel disabled).
  - Never throws into the indexer (logs and continues) — a notification failure must not break
    indexing.
- **`notifications.controller.ts`** (behind global `InternalApiKeyGuard`, pattern of
  `escrow.controller.ts`):
  - `GET /v1/notifications/users/:id` (`ParseUUIDPipe`, optional `limit`) → `{ notifications: [...] }`
    most-recent-first.
  - `GET /v1/notifications/users/:id/unread-count` → `{ count }`.
  - `PATCH /v1/notifications/:id/read` → sets `read_at`, returns the updated row.

### Escrow indexer change (`domains/escrow/escrow-indexer.service.ts`)
Change the blind upsert to **read-before-write**:
1. Before updating, read the existing row's `id, on_chain_status, buyer_id, seller_id` (matched by
   `engagement_id`).
2. Compute `patch = toEscrowPatch(...)`. Run `detectEscrowTransition(old.on_chain_status,
   patch.on_chain_status)`.
3. **Crash-safe order:** if a transition is detected, first
   `await notifications.onEscrowReleased({ escrowId: old.id, buyerId, sellerId, engagementId, amount
   })` (idempotent via the UNIQUE constraint), **then** update the escrow row's status/state.
4. If the row doesn't exist (unmatched) keep current behavior (skip; the web owns creation).

`EscrowIndexerService` gains a `NotificationsService` constructor dep (VALUE import + biome-ignore).
`EscrowModule` imports `NotificationsModule`.

### Migration
`supabase/migrations/<ts>_create_notifications.sql`:
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  escrow_id    UUID REFERENCES escrows(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at      TIMESTAMPTZ,
  email_status TEXT NOT NULL DEFAULT 'skipped',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_user_type_escrow
  ON notifications(user_id, type, escrow_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_email_pending
  ON notifications(email_status) WHERE email_status = 'pending';
```
Applied to the dev project (`kzlsbhpyszkalyflbqjg`) via the Supabase MCP `apply_migration`
(additive/idempotent) **before** the backend writes the table. RLS: enable + a select-own policy
consistent with the other tables (backend uses the service-role client, which bypasses RLS).

### Env (backend)
`RESEND_API_KEY` (string, `allow('')`, default `''` → email disabled) and `EMAIL_FROM`
(string, default `Pacto <no-reply@pacto.app>`). Joi in `config/env.validation.ts` +
`apps/backend/.env.example`. Empty default so missing config doesn't fail boot (feature-flag style).

## Testing
- **Pure unit:** `escrow-transition.spec.ts` (full old→new status matrix incl. null baseline),
  `notification-prefs.spec.ts` (canonical/legacy/defaults), `notification-builder.spec.ts`
  (two drafts, role-aware copy, `data` payload), `escrow-released.template.spec.ts`
  (subject/html/text, buyer vs seller).
- **`email.service.spec.ts`:** disabled path returns `{ skipped }` and makes **no** network call;
  enabled path (Resend mocked) maps success → `sent`, error → `failed` (no throw).
- **`notifications.service.spec.ts`** (hand-rolled chainable Supabase mock): inserts both rows;
  in-app row always created; `email_status` = `skipped` when pref off or channel disabled, `sent`
  when both on; `onConflict` dedup on re-run.
- **`escrow-indexer.service.spec.ts`** (extend): detects `funded→released`, calls
  `onEscrowReleased` once, then updates the row; `released→released` and `null→released` (baseline)
  do **not** notify.

## Verification (end-to-end)
1. Apply the migration to the dev project; confirm `notifications` exists.
2. `cd apps/backend && rm -rf dist *.tsbuildinfo && npm run build` compiles clean; compiled `dist`
   `design:paramtypes` for the changed services is not `[void 0]` (DI intact). `npm test` green
   (new + existing). Backend `biome:check` clean.
3. `GET /v1/notifications/users/<uuid>` (with `x-internal-key`) → `200 { "notifications": [] }` for a
   user with none; `…/unread-count` → `{ "count": 0 }`.
4. Simulate a transition (indexer with `CRON_ENABLED=true`, or a direct `indexAll()` call) where an
   escrow goes `funded → released`: two `notifications` rows appear (buyer + seller),
   `email_status='skipped'` (key empty); a second tick does **not** duplicate (UNIQUE).
5. With `RESEND_API_KEY` set (free tier) and a recipient whose `email_escrows=true`, a transition
   sends a real email and that row's `email_status='sent'`.
6. `PATCH /v1/notifications/<id>/read` sets `read_at`; `unread-count` decreases.

## Out of scope (#139)
- **Web UI** (notification bell/feed) — separate frontend issue; this phase only exposes the read API.
- **Push / SMS channels** — the UI toggles exist but stay inert (YAGNI).
- **Events other than `released`** — `funded`/`disputed`/`resolved` are trivial extensions later.
- **Email retry/queue worker** — inline send only; `email_status='failed'` is the future seam.
- **Stats-driven notifications** (reputation/threshold) — not in v1.
- **Phase 4b stuck-escrow sweep** (remaining half of #138) — separate work.
