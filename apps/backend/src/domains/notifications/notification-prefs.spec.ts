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
