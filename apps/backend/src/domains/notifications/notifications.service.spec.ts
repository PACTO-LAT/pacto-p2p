import type { EmailService } from '@core/email/email.service';
import type { SupabaseService } from '@core/supabase/supabase.service';
import { NotificationsService } from '@domains/notifications/notifications.service';

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
  return {
    service: { client } as unknown as SupabaseService,
    inserted,
    updates,
  };
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
    const email = {
      isEnabled: () => false,
      send: jest.fn(),
    } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect(inserted).toHaveLength(2);
    expect(inserted[0].email_status).toBe('pending');
    expect(updates.every((u) => u.email_status === 'skipped')).toBe(true);
    expect(email.send as jest.Mock).not.toHaveBeenCalled();
  });

  it('does not resend email for an already-existing row (dedup)', async () => {
    const { service, updates } = makeSupabase({ existing: true });
    const email = {
      isEnabled: () => true,
      send: jest.fn(),
    } as unknown as EmailService;
    await new NotificationsService(service, email).onEscrowReleased(input);
    expect(email.send as jest.Mock).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });

  it('sends email and marks sent when enabled and pref on', async () => {
    const { service, updates } = makeSupabase({
      existing: false,
      user: {
        email: 'a@b.com',
        full_name: 'Alice',
        notifications: { email_escrows: true },
      },
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
