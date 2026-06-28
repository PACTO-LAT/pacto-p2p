# Backend Phase 5 — Notification Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the escrow indexer detects an escrow transition to `released`, persist in-app notification rows (one per party) to a new `notifications` table and optionally send an email via Resend — with the email channel **disabled by default** (empty `RESEND_API_KEY`). Expose a read API for the rows.

**Architecture:** A `core/email` module wraps Resend behind `isEnabled()`/`send()` (no-op when unconfigured). A new `domains/notifications` context holds pure helpers (`detectEscrowTransition`, `normalizeNotifications`, `buildReleasedNotifications`), a `NotificationsService` that inserts rows (idempotent via a UNIQUE constraint) and conditionally emails, a read controller, and the module. The escrow indexer is changed from a blind upsert to **read-before-write**: it reads the prior `on_chain_status`, detects a `→released` transition, calls `NotificationsService.onEscrowReleased(...)` **before** writing the new status (crash-safe), and the UNIQUE constraint dedups. Flow is one-way Escrow → Notifications.

**Tech Stack:** NestJS 11, `resend` (npm), `@supabase/supabase-js` (service role), `@nestjs/config` (Joi), `@pacto-p2p/types` (`Escrow`), Jest.

**Spec:** `docs/superpowers/specs/2026-06-27-backend-notifications-phase5-design.md`
**Branch:** `feat/139-notifications` (stacked on `feat/138a-escrow-indexing` — escrow indexing provides the state the events derive from).
**Build hygiene:** `rm -rf apps/backend/dist apps/backend/*.tsbuildinfo` before backend builds; run from `apps/backend`.
**DI footgun:** injected deps (`ConfigService`, `SupabaseService`, `EmailService`, `NotificationsService`, `EscrowIndexerService`) are VALUE imports with `// biome-ignore lint/style/useImportType: required for NestJS dependency injection`. Pure-helper types stay `import type`.
**Git/PR:** NO `Co-Authored-By`, NO "Generated with Claude" footer. PR to `PACTO-LAT/pacto-p2p` base `develop`, gh account `aguilar1x`.

---

## File map

| File | Responsibility |
|---|---|
| `supabase/migrations/20260627120000_create_notifications.sql` | `notifications` table + unique/idx |
| `apps/backend/src/config/env.validation.ts` (mod), `.env.example` (mod) | `RESEND_API_KEY`, `EMAIL_FROM` |
| `apps/backend/package.json` (mod) | add `resend` dep |
| `apps/backend/src/core/email/email.config.ts` | reserved typed accessors (optional, inline ok) |
| `.../core/email/email.service.ts` (+ `.spec.ts`) | `isEnabled()` + `send()` (skipped when off) |
| `.../core/email/templates/escrow-released.template.ts` (+ `.spec.ts`) | pure `renderEscrowReleasedEmail` |
| `.../core/email/email.module.ts` | `@Global` provides/exports `EmailService` |
| `apps/backend/src/core/core.module.ts` (mod) | import `EmailModule` |
| `apps/backend/src/domains/notifications/notifications.types.ts` | shared types |
| `.../notifications/escrow-transition.ts` (+ `.spec.ts`) | pure `detectEscrowTransition` |
| `.../notifications/notification-prefs.ts` (+ `.spec.ts`) | pure `normalizeNotifications` |
| `.../notifications/notification-builder.ts` (+ `.spec.ts`) | pure `buildReleasedNotifications` |
| `.../notifications/notifications.service.ts` (+ `.spec.ts`) | insert rows + conditional email |
| `.../notifications/notifications.controller.ts` | `GET`/`PATCH /v1/notifications...` |
| `.../notifications/notifications.module.ts` | wires service+controller, exports service |
| `.../domains/escrow/escrow-indexer.service.ts` (mod, + spec mod) | read-before-write + notify |
| `.../domains/escrow/escrow.module.ts` (mod) | import `NotificationsModule` |

---

## Task 1: Migration + email env + `resend` dependency

**Files:**
- Create: `supabase/migrations/20260627120000_create_notifications.sql`
- Modify: `apps/backend/src/config/env.validation.ts`, `apps/backend/.env.example`, `apps/backend/package.json`

- [ ] **Step 1: Create the migration**

```sql
-- Persist in-app notifications. email_status tracks the optional email channel.
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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications FOR SELECT
  USING (auth.uid() = user_id);
```
Confirm the filename sorts last: `ls supabase/migrations | sort | tail -3`. Do NOT apply to remote here (Task 6 applies it to dev). The backend uses the service-role client, which bypasses RLS — the policy is for parity/defense-in-depth.

- [ ] **Step 2: Add email env to `apps/backend/src/config/env.validation.ts`**

Inside the `Joi.object({ ... })`, after `ESCROW_INDEX_CRON`, add:
```ts
  RESEND_API_KEY: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().default('Pacto <no-reply@pacto.app>'),
```
(`RESEND_API_KEY` empty → email channel disabled; missing config is feature-flag-off, not a boot failure.)

- [ ] **Step 3: Document them in `apps/backend/.env.example`**

Append:
```dotenv

# Email notifications via Resend (leave RESEND_API_KEY empty to disable email; in-app notifications still work)
RESEND_API_KEY=
EMAIL_FROM=Pacto <no-reply@pacto.app>
```

- [ ] **Step 4: Add the `resend` dependency**

Run (matches the web's `resend@^4.8.0`):
```bash
cd apps/backend && npm install resend@^4.8.0 && cd ../..
```
Expected: `resend` appears in `apps/backend/package.json` dependencies; lockfile updated.

- [ ] **Step 5: Verify build**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build)
```
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260627120000_create_notifications.sql apps/backend/src/config/env.validation.ts apps/backend/.env.example apps/backend/package.json package-lock.json
git commit -m "feat(backend): add notifications table + email env + resend dep (#139)"
```

---

## Task 2: `core/email` module (disabled by default)

**Files:**
- Create: `apps/backend/src/core/email/templates/escrow-released.template.ts`, `escrow-released.template.spec.ts`, `email.service.ts`, `email.service.spec.ts`, `email.module.ts`
- Modify: `apps/backend/src/core/core.module.ts`

- [ ] **Step 1: Write `escrow-released.template.spec.ts` (failing)**

```ts
import { renderEscrowReleasedEmail } from '@core/email/templates/escrow-released.template';

describe('renderEscrowReleasedEmail', () => {
  it('produces subject/text/html and greets by name when provided', () => {
    const out = renderEscrowReleasedEmail({
      recipientName: 'Alice',
      role: 'buyer',
      engagementId: 'eng1',
      amount: 250,
    });
    expect(out.subject).toMatch(/liberad/i);
    expect(out.text).toContain('Alice');
    expect(out.text).toContain('eng1');
    expect(out.html).toContain('eng1');
  });

  it('uses seller copy and a generic greeting without a name', () => {
    const buyer = renderEscrowReleasedEmail({ role: 'buyer', engagementId: 'e', amount: 1 });
    const seller = renderEscrowReleasedEmail({ role: 'seller', engagementId: 'e', amount: 1 });
    expect(seller.text).not.toEqual(buyer.text);
    expect(seller.text).toContain('Hola,');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- escrow-released.template`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `escrow-released.template.ts`**

```ts
export interface EscrowReleasedEmailData {
  recipientName?: string;
  role: 'buyer' | 'seller';
  engagementId: string;
  amount: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderEscrowReleasedEmail(
  data: EscrowReleasedEmailData
): RenderedEmail {
  const greeting = data.recipientName ? `Hola ${data.recipientName},` : 'Hola,';
  const line =
    data.role === 'buyer'
      ? `Los fondos de tu escrow ${data.engagementId} fueron liberados al vendedor.`
      : `Se liberaron los fondos del escrow ${data.engagementId}. La operación se completó.`;
  const subject = 'Pacto — Fondos liberados';
  const text = `${greeting}\n\n${line}\n\nMonto: ${data.amount}\n\n— Pacto`;
  const html = `<div style="font-family:sans-serif;color:#111">
  <p>${greeting}</p>
  <p>${line}</p>
  <p><strong>Monto:</strong> ${data.amount}</p>
  <p style="color:#059669">— Pacto</p>
</div>`;
  return { subject, html, text };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- escrow-released.template`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `email.service.spec.ts` (disabled path makes no network call)**

```ts
import { EmailService } from '@core/email/email.service';
import type { ConfigService } from '@nestjs/config';

function cfg(values: Record<string, string>): ConfigService {
  return {
    get: <T>(k: string, d?: T) => (values[k] as unknown as T) ?? d,
  } as unknown as ConfigService;
}

describe('EmailService', () => {
  const ORIGINAL_FETCH = global.fetch;
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    jest.restoreAllMocks();
  });

  it('isEnabled is false when RESEND_API_KEY is empty', () => {
    expect(new EmailService(cfg({})).isEnabled()).toBe(false);
    expect(new EmailService(cfg({ RESEND_API_KEY: 're_x' })).isEnabled()).toBe(true);
  });

  it('send returns skipped and makes NO network call when disabled', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const svc = new EmailService(cfg({}));
    const res = await svc.send({ to: 'a@b.com', subject: 's', html: '<p>x</p>', text: 'x' });
    expect(res.status).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Implement `email.service.ts`**

```ts
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type EmailSendStatus = 'sent' | 'failed' | 'skipped';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return !!this.config.get<string>('RESEND_API_KEY');
  }

  async send(input: SendEmailInput): Promise<{ status: EmailSendStatus }> {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    if (!apiKey) {
      return { status: 'skipped' };
    }
    const from = this.config.get<string>(
      'EMAIL_FROM',
      'Pacto <no-reply@pacto.app>'
    );
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      if (error) {
        this.logger.error(`email send failed: ${error.message}`);
        return { status: 'failed' };
      }
      return { status: 'sent' };
    } catch (err) {
      this.logger.error(`email send threw: ${(err as Error).message}`);
      return { status: 'failed' };
    }
  }
}
```

- [ ] **Step 7: Run the test**

Run: `cd apps/backend && npm test -- email.service`
Expected: PASS (2 tests).

- [ ] **Step 8: Create `email.module.ts`**

```ts
import { EmailService } from '@core/email/email.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

- [ ] **Step 9: Import `EmailModule` in `apps/backend/src/core/core.module.ts`**

Add `import { EmailModule } from '@core/email/email.module';` and add `EmailModule` to the `imports` array (alongside `SupabaseModule`, `HealthModule`, `TrustlessModule`).

- [ ] **Step 10: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/core/email apps/backend/src/core/core.module.ts
git commit -m "feat(backend): add core/email module (Resend, disabled by default) (#139)"
```

---

## Task 3: Pure helpers (TDD) — transition, prefs, builder, types

**Files:**
- Create: `apps/backend/src/domains/notifications/notifications.types.ts`, `escrow-transition.ts`, `escrow-transition.spec.ts`, `notification-prefs.ts`, `notification-prefs.spec.ts`, `notification-builder.ts`, `notification-builder.spec.ts`

- [ ] **Step 1: Create `notifications.types.ts`**

```ts
export type NotificationType = 'escrow_released';

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface NotificationPrefs {
  email_trades: boolean;
  email_escrows: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface NotificationDraft {
  user_id: string;
  type: NotificationType;
  escrow_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export interface EscrowReleasedInput {
  escrowId: string;
  buyerId: string;
  sellerId: string;
  engagementId: string;
  amount: number;
}

export interface TransitionEvent {
  kind: NotificationType;
}
```

- [ ] **Step 2: Write `escrow-transition.spec.ts` (failing)**

```ts
import { detectEscrowTransition } from '@domains/notifications/escrow-transition';

describe('detectEscrowTransition', () => {
  it('fires escrow_released on a non-released → released transition', () => {
    expect(detectEscrowTransition('funded', 'released')).toEqual({ kind: 'escrow_released' });
    expect(detectEscrowTransition('active', 'released')).toEqual({ kind: 'escrow_released' });
    expect(detectEscrowTransition('disputed', 'released')).toEqual({ kind: 'escrow_released' });
  });

  it('does NOT fire when already released (idempotent re-index)', () => {
    expect(detectEscrowTransition('released', 'released')).toBeNull();
  });

  it('does NOT fire for non-released targets', () => {
    expect(detectEscrowTransition('active', 'funded')).toBeNull();
    expect(detectEscrowTransition('funded', 'disputed')).toBeNull();
  });

  it('anti-backfill: null/undefined prior status never fires (baseline)', () => {
    expect(detectEscrowTransition(null, 'released')).toBeNull();
    expect(detectEscrowTransition(undefined, 'released')).toBeNull();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `cd apps/backend && npm test -- escrow-transition`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement `escrow-transition.ts`**

```ts
import type { TransitionEvent } from '@domains/notifications/notifications.types';

export function detectEscrowTransition(
  oldStatus: string | null | undefined,
  newStatus: string
): TransitionEvent | null {
  // Anti-backfill: a never-indexed escrow (null prior) is treated as baseline.
  if (oldStatus == null) {
    return null;
  }
  if (oldStatus !== 'released' && newStatus === 'released') {
    return { kind: 'escrow_released' };
  }
  return null;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `cd apps/backend && npm test -- escrow-transition`
Expected: PASS (4 tests).

- [ ] **Step 6: Write `notification-prefs.spec.ts` (failing)**

```ts
import { normalizeNotifications } from '@domains/notifications/notification-prefs';

describe('normalizeNotifications', () => {
  it('defaults to email on / sms off for empty input', () => {
    expect(normalizeNotifications(null)).toEqual({
      email_trades: true,
      email_escrows: true,
      push_notifications: true,
      sms_notifications: false,
    });
  });

  it('reads canonical fields', () => {
    const p = normalizeNotifications({ email_escrows: false });
    expect(p.email_escrows).toBe(false);
    expect(p.email_trades).toBe(true);
  });

  it('maps legacy { email, push } shape', () => {
    const p = normalizeNotifications({ email: false, push: false });
    expect(p.email_escrows).toBe(false);
    expect(p.email_trades).toBe(false);
    expect(p.push_notifications).toBe(false);
  });
});
```

- [ ] **Step 7: Run to verify it fails**

Run: `cd apps/backend && npm test -- notification-prefs`
Expected: FAIL (module not found).

- [ ] **Step 8: Implement `notification-prefs.ts`** (ported from `apps/web/lib/utils/normalize-user.ts`)

```ts
import type { NotificationPrefs } from '@domains/notifications/notifications.types';

export function normalizeNotifications(value: unknown): NotificationPrefs {
  if (!value || typeof value !== 'object') {
    return {
      email_trades: true,
      email_escrows: true,
      push_notifications: true,
      sms_notifications: false,
    };
  }
  const o = value as Record<string, unknown>;
  return {
    email_trades: Boolean(o.email_trades ?? o.email ?? true),
    email_escrows: Boolean(o.email_escrows ?? o.email ?? true),
    push_notifications: Boolean(o.push_notifications ?? o.push ?? true),
    sms_notifications: Boolean(o.sms_notifications ?? o.sms ?? false),
  };
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `cd apps/backend && npm test -- notification-prefs`
Expected: PASS (3 tests).

- [ ] **Step 10: Write `notification-builder.spec.ts` (failing)**

```ts
import { buildReleasedNotifications } from '@domains/notifications/notification-builder';

const input = {
  escrowId: 'esc-1',
  buyerId: 'buyer-1',
  sellerId: 'seller-1',
  engagementId: 'eng-1',
  amount: 250,
};

describe('buildReleasedNotifications', () => {
  it('produces one draft per party with role-aware data', () => {
    const drafts = buildReleasedNotifications(input);
    expect(drafts).toHaveLength(2);
    const buyer = drafts.find((d) => d.user_id === 'buyer-1');
    const seller = drafts.find((d) => d.user_id === 'seller-1');
    expect(buyer?.type).toBe('escrow_released');
    expect(buyer?.escrow_id).toBe('esc-1');
    expect(buyer?.data.role).toBe('buyer');
    expect(buyer?.data.counterparty_id).toBe('seller-1');
    expect(seller?.data.role).toBe('seller');
    expect(seller?.data.engagement_id).toBe('eng-1');
    expect(seller?.body).not.toEqual(buyer?.body);
  });
});
```

- [ ] **Step 11: Run to verify it fails**

Run: `cd apps/backend && npm test -- notification-builder`
Expected: FAIL (module not found).

- [ ] **Step 12: Implement `notification-builder.ts`**

```ts
import type {
  EscrowReleasedInput,
  NotificationDraft,
} from '@domains/notifications/notifications.types';

export function buildReleasedNotifications(
  input: EscrowReleasedInput
): NotificationDraft[] {
  const { escrowId, buyerId, sellerId, engagementId, amount } = input;
  const common = { type: 'escrow_released' as const, escrow_id: escrowId };
  return [
    {
      ...common,
      user_id: buyerId,
      title: 'Fondos liberados',
      body: `Los fondos de tu escrow ${engagementId} fueron liberados al vendedor.`,
      data: {
        engagement_id: engagementId,
        amount,
        role: 'buyer',
        counterparty_id: sellerId,
      },
    },
    {
      ...common,
      user_id: sellerId,
      title: 'Recibiste la liberación de fondos',
      body: `Se liberaron los fondos del escrow ${engagementId}. La operación se completó.`,
      data: {
        engagement_id: engagementId,
        amount,
        role: 'seller',
        counterparty_id: buyerId,
      },
    },
  ];
}
```

- [ ] **Step 13: Run to verify it passes + commit**

```bash
cd apps/backend && npm test -- notification-builder escrow-transition notification-prefs
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/domains/notifications
git commit -m "feat(backend): add notification pure helpers (transition/prefs/builder) (#139)"
```
Expected: PASS (all helper suites).

---

## Task 4: `NotificationsService` + controller + module

**Files:**
- Create: `apps/backend/src/domains/notifications/notifications.service.ts`, `notifications.service.spec.ts`, `notifications.controller.ts`, `notifications.module.ts`

**Delivery semantics (important):** insert the in-app row FIRST with `email_status='pending'` and `ignoreDuplicates` (UNIQUE backstop). The upsert's `.select('id')` returns the inserted row, or `[]` if it already existed. Only when a NEW row was inserted do we resolve+send the email and then persist the final status — this dedups the email on a crash-retry (re-index re-detects the transition until the escrow status write lands).

- [ ] **Step 1: Write `notifications.service.spec.ts` (failing)**

```ts
import { NotificationsService } from '@domains/notifications/notifications.service';
import type { EmailService } from '@core/email/email.service';
import type { SupabaseService } from '@core/supabase/supabase.service';

// Chainable Supabase mock: notifications upsert(...).select('id') resolves via then();
// notifications update(...).eq() resolves via then(); users select(...).eq().maybeSingle() resolves the user.
function makeSupabase(opts: { user?: any; existing?: boolean }) {
  const inserted: any[] = [];
  const updates: any[] = [];
  const client = {
    from(table: string) {
      const b: any = {
        _op: null as null | 'upsert' | 'update',
        _payload: null as any,
        upsert(payload: any) {
          b._op = 'upsert';
          b._payload = payload;
          return b;
        },
        update(payload: any) {
          b._op = 'update';
          b._payload = payload;
          return b;
        },
        select() {
          return b;
        },
        eq() {
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: opts.user ?? null, error: null });
        },
        // biome-ignore lint/suspicious/noThenProperty: intentional thenable to mimic Supabase's chainable builder
        then(resolve: any) {
          if (table === 'notifications' && b._op === 'upsert') {
            inserted.push(b._payload);
            const data = opts.existing ? [] : [{ id: `n-${inserted.length}` }];
            return Promise.resolve({ data, error: null }).then(resolve);
          }
          if (table === 'notifications' && b._op === 'update') {
            updates.push(b._payload);
            return Promise.resolve({ data: null, error: null }).then(resolve);
          }
          return Promise.resolve({ data: null, error: null }).then(resolve);
        },
      };
      return b;
    },
  };
  return { service: { client } as unknown as SupabaseService, inserted, updates };
}

const input = {
  escrowId: 'esc-1',
  buyerId: 'buyer-1',
  sellerId: 'seller-1',
  engagementId: 'eng-1',
  amount: 250,
};

describe('NotificationsService.onEscrowReleased', () => {
  it('inserts a row per party with email skipped when channel disabled', async () => {
    const { service, inserted, updates } = makeSupabase({ existing: false });
    const email = { isEnabled: () => false, send: jest.fn() } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect(inserted).toHaveLength(2);
    expect(inserted[0].email_status).toBe('pending');
    // email disabled → resolved to skipped, persisted via update
    expect(updates.every((u) => u.email_status === 'skipped')).toBe(true);
    expect((email.send as jest.Mock)).not.toHaveBeenCalled();
  });

  it('does not resend email for an already-existing row (dedup)', async () => {
    const { service, updates } = makeSupabase({ existing: true });
    const email = { isEnabled: () => true, send: jest.fn() } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect((email.send as jest.Mock)).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });

  it('sends email and marks sent when enabled and pref on', async () => {
    const { service, updates } = makeSupabase({
      existing: false,
      user: { email: 'a@b.com', full_name: 'Alice', notifications: { email_escrows: true } },
    });
    const send = jest.fn().mockResolvedValue({ status: 'sent' });
    const email = { isEnabled: () => true, send } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect(send).toHaveBeenCalledTimes(2);
    expect(updates.every((u) => u.email_status === 'sent')).toBe(true);
  });

  it('skips email when pref email_escrows is off', async () => {
    const { service, updates } = makeSupabase({
      existing: false,
      user: { email: 'a@b.com', notifications: { email_escrows: false } },
    });
    const send = jest.fn();
    const email = { isEnabled: () => true, send } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect(send).not.toHaveBeenCalled();
    expect(updates.every((u) => u.email_status === 'skipped')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- notifications.service`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `notifications.service.ts`**

```ts
import { renderEscrowReleasedEmail } from '@core/email/templates/escrow-released.template';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EmailService } from '@core/email/email.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
import { buildReleasedNotifications } from '@domains/notifications/notification-builder';
import { normalizeNotifications } from '@domains/notifications/notification-prefs';
import type {
  EmailStatus,
  EscrowReleasedInput,
  NotificationDraft,
} from '@domains/notifications/notifications.types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly email: EmailService
  ) {}

  async onEscrowReleased(input: EscrowReleasedInput): Promise<void> {
    for (const draft of buildReleasedNotifications(input)) {
      try {
        await this.deliver(draft, input);
      } catch (err) {
        this.logger.error(
          `notify ${draft.user_id} failed: ${(err as Error).message}`
        );
      }
    }
  }

  private async deliver(
    draft: NotificationDraft,
    input: EscrowReleasedInput
  ): Promise<void> {
    // Insert first (idempotent). New row → [{id}]; existing → [] (already delivered).
    const { data: rows, error } = await this.supabase.client
      .from('notifications')
      .upsert(
        { ...draft, email_status: 'pending' as EmailStatus },
        { onConflict: 'user_id,type,escrow_id', ignoreDuplicates: true }
      )
      .select('id');
    if (error) {
      this.logger.error(`insert notification failed: ${error.message}`);
      return;
    }
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) {
      return; // already delivered previously — do not resend
    }

    const status = await this.resolveEmail(draft, input);
    await this.supabase.client
      .from('notifications')
      .update({ email_status: status })
      .eq('id', row.id);
  }

  private async resolveEmail(
    draft: NotificationDraft,
    input: EscrowReleasedInput
  ): Promise<EmailStatus> {
    if (!this.email.isEnabled()) {
      return 'skipped';
    }
    const { data: user } = await this.supabase.client
      .from('users')
      .select('email, full_name, notifications')
      .eq('id', draft.user_id)
      .maybeSingle();
    if (!user?.email) {
      return 'skipped';
    }
    if (!normalizeNotifications(user.notifications).email_escrows) {
      return 'skipped';
    }
    const role = draft.data.role === 'seller' ? 'seller' : 'buyer';
    const rendered = renderEscrowReleasedEmail({
      recipientName: user.full_name ?? undefined,
      role,
      engagementId: input.engagementId,
      amount: input.amount,
    });
    const { status } = await this.email.send({ to: user.email, ...rendered });
    return status;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd apps/backend && npm test -- notifications.service`
Expected: PASS (4 tests).

- [ ] **Step 5: Create `notifications.controller.ts`** (pattern of `escrow.controller.ts`)

```ts
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { NotificationsService } from '@domains/notifications/notifications.service';

@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('notifications/users/:id')
  @ApiOperation({ summary: 'Recent notifications for a user (most recent first).' })
  async forUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string
  ) {
    const max = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return { notifications: await this.notifications.listForUser(id, max) };
  }

  @Get('notifications/users/:id/unread-count')
  @ApiOperation({ summary: 'Count of unread notifications for a user.' })
  async unreadCount(@Param('id', ParseUUIDPipe) id: string) {
    return { count: await this.notifications.unreadCount(id) };
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read.' })
  async markRead(@Param('id', ParseUUIDPipe) id: string) {
    return { notification: await this.notifications.markRead(id) };
  }
}
```

- [ ] **Step 6: Add the read/mutate methods to `notifications.service.ts`**

Append these methods inside the `NotificationsService` class (after `onEscrowReleased`):
```ts
  async listForUser(userId: string, limit: number): Promise<unknown[]> {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('id, type, escrow_id, title, body, data, read_at, email_status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      throw new Error(`Failed to load notifications for ${userId}: ${error.message}`);
    }
    return data ?? [];
  }

  async unreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase.client
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) {
      throw new Error(`Failed to count notifications for ${userId}: ${error.message}`);
    }
    return count ?? 0;
  }

  async markRead(id: string): Promise<unknown> {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, read_at')
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to mark notification ${id} read: ${error.message}`);
    }
    return data;
  }
```

- [ ] **Step 7: Create `notifications.module.ts`**

```ts
import { NotificationsController } from '@domains/notifications/notifications.controller';
import { NotificationsService } from '@domains/notifications/notifications.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```
(`SupabaseService` and `EmailService` come from the `@Global` `SupabaseModule`/`EmailModule`, so no import needed.)

- [ ] **Step 8: Register `NotificationsModule` in `apps/backend/src/app.module.ts`**

Add `import { NotificationsModule } from '@domains/notifications/notifications.module';` and add `NotificationsModule` to the `imports` array (after `EscrowModule`). This mounts the controller routes even before the escrow wiring (Task 5).

- [ ] **Step 9: Biome + type-check + full test + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && npm test && cd ../..
npm run type-check
git add apps/backend/src/domains/notifications apps/backend/src/app.module.ts
git commit -m "feat(backend): add notifications service + read API + module (#139)"
```

---

## Task 5: Wire transition detection into the escrow indexer

**Files:**
- Modify: `apps/backend/src/domains/escrow/escrow-indexer.service.ts`, `escrow-indexer.service.spec.ts`, `apps/backend/src/domains/escrow/escrow.module.ts`

- [ ] **Step 1: Replace `escrow-indexer.service.spec.ts` with the read-before-write + notify version**

```ts
import type { SupabaseService } from '@core/supabase/supabase.service';
import type { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import type { NotificationsService } from '@domains/notifications/notifications.service';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';

// Mock: notifications row read via select().eq().maybeSingle(); escrow update via update().eq().
function makeSupabase(existing: any | null) {
  const updates: Array<{ match: string; payload: any }> = [];
  const client = {
    from(_table: string) {
      const b: any = {
        _payload: null as any,
        select() {
          return b;
        },
        update(p: any) {
          b._payload = p;
          return b;
        },
        maybeSingle() {
          return Promise.resolve({ data: existing, error: null });
        },
        eq(_col: string, val: string) {
          if (b._payload) {
            updates.push({ match: val, payload: b._payload });
            return Promise.resolve({ data: null, error: null });
          }
          return b;
        },
      };
      return b;
    },
  };
  return { service: { client } as unknown as SupabaseService, updates };
}

const indexerWith = (escrows: any[]) =>
  ({
    isConfigured: () => true,
    getPlatformEscrows: jest.fn().mockResolvedValue(escrows),
  }) as unknown as TrustlessIndexerService;

const notifySpy = () => {
  const onEscrowReleased = jest.fn().mockResolvedValue(undefined);
  return { svc: { onEscrowReleased } as unknown as NotificationsService, onEscrowReleased };
};

describe('EscrowIndexerService.indexAll', () => {
  it('updates the matched escrow row with the mapped patch', async () => {
    const { service, updates } = makeSupabase({
      id: 'esc-1',
      on_chain_status: 'active',
      buyer_id: 'b',
      seller_id: 's',
    });
    const { svc } = notifySpy();
    const res = await new EscrowIndexerService(
      service,
      indexerWith([{ engagementId: 'eng1', amount: 100, balance: 100, flags: {} }]),
      svc
    ).indexAll();
    expect(res.indexed).toBe(1);
    expect(updates[0].match).toBe('eng1');
    expect(updates[0].payload.on_chain_status).toBe('funded');
  });

  it('notifies once on a funded → released transition, before writing status', async () => {
    const { service } = makeSupabase({
      id: 'esc-1',
      on_chain_status: 'funded',
      buyer_id: 'b',
      seller_id: 's',
    });
    const { svc, onEscrowReleased } = notifySpy();
    await new EscrowIndexerService(
      service,
      indexerWith([{ engagementId: 'eng1', amount: 100, balance: 100, flags: { released: true } }]),
      svc
    ).indexAll();
    expect(onEscrowReleased).toHaveBeenCalledTimes(1);
    expect(onEscrowReleased).toHaveBeenCalledWith({
      escrowId: 'esc-1',
      buyerId: 'b',
      sellerId: 's',
      engagementId: 'eng1',
      amount: 100,
    });
  });

  it('does NOT notify when already released (idempotent) or on baseline (no prior row)', async () => {
    const already = makeSupabase({ id: 'esc-1', on_chain_status: 'released', buyer_id: 'b', seller_id: 's' });
    const n1 = notifySpy();
    await new EscrowIndexerService(
      already.service,
      indexerWith([{ engagementId: 'eng1', amount: 1, balance: 1, flags: { released: true } }]),
      n1.svc
    ).indexAll();
    expect(n1.onEscrowReleased).not.toHaveBeenCalled();

    const missing = makeSupabase(null);
    const n2 = notifySpy();
    const res = await new EscrowIndexerService(
      missing.service,
      indexerWith([{ engagementId: 'eng1', amount: 1, balance: 1, flags: { released: true } }]),
      n2.svc
    ).indexAll();
    expect(n2.onEscrowReleased).not.toHaveBeenCalled();
    expect(res.unmatched).toBe(1);
  });

  it('no-ops when TLW is not configured', async () => {
    const { service } = makeSupabase(null);
    const { svc } = notifySpy();
    const notConfigured = {
      isConfigured: () => false,
      getPlatformEscrows: jest.fn(),
    } as unknown as TrustlessIndexerService;
    const res = await new EscrowIndexerService(service, notConfigured, svc).indexAll();
    expect(res.indexed).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd apps/backend && npm test -- escrow-indexer`
Expected: FAIL (constructor arity / `maybeSingle` not handled by old code).

- [ ] **Step 3: Rewrite `escrow-indexer.service.ts`**

```ts
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { SupabaseService } from '@core/supabase/supabase.service';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { TrustlessIndexerService } from '@core/trustless/trustless-indexer.service';
import { toEscrowPatch } from '@domains/escrow/escrow-mapper';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { NotificationsService } from '@domains/notifications/notifications.service';
import { detectEscrowTransition } from '@domains/notifications/escrow-transition';

@Injectable()
export class EscrowIndexerService {
  private readonly logger = new Logger(EscrowIndexerService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly indexer: TrustlessIndexerService,
    private readonly notifications: NotificationsService
  ) {}

  async indexAll(): Promise<{ indexed: number; unmatched: number }> {
    if (!this.indexer.isConfigured()) {
      this.logger.warn(
        'TLW not configured (TLW_API_KEY/PLATFORM_ROLE_ADDRESS); skipping escrow indexing'
      );
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

      // Read prior state to detect a transition (and to resolve the parties).
      const { data: existing } = await this.supabase.client
        .from('escrows')
        .select('id, on_chain_status, buyer_id, seller_id')
        .eq('engagement_id', escrow.engagementId)
        .maybeSingle();
      if (!existing) {
        unmatched += 1;
        continue; // web owns row creation; we only enrich existing rows
      }

      // Crash-safe: notify BEFORE writing the new status (re-index re-detects
      // until the status write lands; NotificationsService dedups via UNIQUE).
      const transition = detectEscrowTransition(
        existing.on_chain_status,
        patch.on_chain_status
      );
      if (transition?.kind === 'escrow_released') {
        await this.notifications.onEscrowReleased({
          escrowId: existing.id,
          buyerId: existing.buyer_id,
          sellerId: existing.seller_id,
          engagementId: escrow.engagementId,
          amount: patch.token_amount,
        });
      }

      const { error } = await this.supabase.client
        .from('escrows')
        .update({ ...patch, updated_at: new Date(now).toISOString() })
        .eq('engagement_id', escrow.engagementId);
      if (error) {
        this.logger.error(
          `index ${escrow.engagementId} failed: ${error.message}`
        );
        unmatched += 1;
      } else {
        indexed += 1;
      }
    }
    this.logger.log(
      `escrow index done indexed=${indexed} unmatched=${unmatched}`
    );
    return { indexed, unmatched };
  }
}
```
Note on the test mock: the recording builder resolves `.eq(...)` to a promise only when an update payload was set; otherwise `.eq(...)` returns the builder and `.maybeSingle()` resolves the prior row. This mirrors the two call shapes (`select().eq().maybeSingle()` and `update().eq()`).

- [ ] **Step 4: Import `NotificationsModule` in `apps/backend/src/domains/escrow/escrow.module.ts`**

```ts
import { EscrowController } from '@domains/escrow/escrow.controller';
import { EscrowService } from '@domains/escrow/escrow.service';
import { EscrowIndexCron } from '@domains/escrow/escrow-index.cron';
import { EscrowIndexerService } from '@domains/escrow/escrow-indexer.service';
import { NotificationsModule } from '@domains/notifications/notifications.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NotificationsModule],
  controllers: [EscrowController],
  providers: [EscrowService, EscrowIndexerService, EscrowIndexCron],
})
export class EscrowModule {}
```
(`NotificationsModule` exports `NotificationsService`, so `EscrowIndexerService` can inject it.)

- [ ] **Step 5: Run tests**

Run: `cd apps/backend && npm test -- escrow-indexer`
Expected: PASS (4 tests).

- [ ] **Step 6: Build + DI smoke**

```bash
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build)
grep -n "design:paramtypes" apps/backend/dist/domains/escrow/escrow-indexer.service.js apps/backend/dist/domains/notifications/notifications.service.js
# → must reference real classes (SupabaseService/TrustlessIndexerService/NotificationsService; SupabaseService/EmailService), NOT [void 0]
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
```
Expected: `design:paramtypes` lists the injected classes (DI intact).

- [ ] **Step 7: Biome + type-check + commit**

```bash
cd apps/backend && npm run biome:fix && npm run biome:check && cd ../..
npm run type-check
git add apps/backend/src/domains/escrow
git commit -m "feat(backend): emit escrow-released notification from indexer (#139)"
```

---

## Task 6: Final verification + PR

- [ ] **Step 1: Full verification**

```bash
cd apps/backend && npm test && npm run biome:check && cd ../..
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
npm run type-check
npm run build
```
Expected: Jest green (template, email, transition, prefs, builder, notifications.service, escrow-indexer + prior suites); type-check + root build pass; backend biome clean.

- [ ] **Step 2: Apply the migration to dev + boot acceptance**

Apply `20260627120000_create_notifications.sql` to the dev project (`kzlsbhpyszkalyflbqjg`) via the Supabase MCP `apply_migration` (additive/idempotent). Then:
```bash
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo && (cd apps/backend && npm run build)
( cd apps/backend && node dist/main.js & sleep 2 ; KEY=$(grep '^INTERNAL_API_KEY=' .env | cut -d= -f2) ; \
  echo -n "no key -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/v1/notifications/users/00000000-0000-0000-0000-000000000000 ; \
  echo -n "list -> " ; curl -s -w " [%{http_code}]\n" -H "x-internal-key: $KEY" localhost:3001/v1/notifications/users/00000000-0000-0000-0000-000000000000 ; \
  echo -n "unread -> " ; curl -s -w " [%{http_code}]\n" -H "x-internal-key: $KEY" localhost:3001/v1/notifications/users/00000000-0000-0000-0000-000000000000/unread-count ; \
  kill %1 ) 2>&1 | grep -iE "no key|list|unread"
rm -rf apps/backend/dist apps/backend/*.tsbuildinfo
```
Expected: `no key -> 401`; `list -> {"notifications":[]} [200]`; `unread -> {"count":0} [200]`.

- [ ] **Step 3: (Optional) live transition check**

With `RESEND_API_KEY` empty and the escrow indexer running against a real TLW escrow that moves to `released`: two `notifications` rows appear (buyer + seller) with `email_status='skipped'`; a second indexer tick does not duplicate (UNIQUE). With `RESEND_API_KEY` set (free tier) and the recipient's `email_escrows=true`, the row's `email_status='sent'` and a real email arrives.

- [ ] **Step 4: Push + open PR**

```bash
git push -u origin feat/139-notifications
gh pr create --repo PACTO-LAT/pacto-p2p --base develop --head feat/139-notifications \
  --title "feat(backend): notification service (phase 5 — #139)" \
  --body "<summary: in-app notifications persisted on escrow→released (both parties); email channel via Resend implemented but DISABLED by empty RESEND_API_KEY; read API GET /v1/notifications/users/:id (+unread-count, PATCH read); read-before-write transition detection added to the escrow indexer (crash-safe + idempotent via UNIQUE); migration applied to dev. Stacked on #138a. No on-chain writes.>"
```
(No `Co-Authored-By`, no "Generated with Claude" footer. Branch is stacked on `feat/138a-escrow-indexing`; the diff includes #138a commits until it merges.)

---

## Self-review checklist (completed during planning)

- **Spec coverage:** migration + email env + `resend` dep (T1); `core/email` disabled-by-default + template (T2); pure `detectEscrowTransition`/`normalizeNotifications`/`buildReleasedNotifications` (T3); `NotificationsService` insert+conditional-email + read API (T4); read-before-write transition wiring in the indexer (T5); verify + dev migration + PR (T6). Every spec section maps to a task.
- **Type consistency:** `NotificationDraft`, `EscrowReleasedInput`, `EmailStatus`, `TransitionEvent`, `NotificationPrefs` are defined once in `notifications.types.ts` (T3 Step 1) and consumed unchanged by the builder (T3), service (T4), transition (T3), and indexer (T5). `renderEscrowReleasedEmail`'s `EscrowReleasedEmailData`/`RenderedEmail` live in the template (T2) and are used by the service (T4). The service's `onEscrowReleased(input)` signature matches the indexer's call site (T5) exactly (`escrowId/buyerId/sellerId/engagementId/amount`).
- **No placeholders:** every code step is complete. The only narrative integration point is the dev migration application in T6 (Supabase MCP), which is an action, not code.
- **Delivery correctness:** insert-first-then-email dedups the email on crash-retry (re-index re-detects the transition until the status write lands; UNIQUE makes the re-insert a no-op and the empty `.select('id')` short-circuits the resend). In-app row is always created; email gated by `email_escrows` AND `isEnabled()`.
- **DI footgun:** `EmailService`, `SupabaseService`, `NotificationsService`, `TrustlessIndexerService` are VALUE imports with the biome-ignore; verified via the `design:paramtypes` grep in T5 Step 6.
- **Out of scope (per spec):** web UI, push/SMS, events other than `released`, email retry worker, stats-driven notifications, phase 4b sweep.
```
