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
