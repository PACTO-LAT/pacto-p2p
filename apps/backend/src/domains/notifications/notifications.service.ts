// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { EmailService } from '@core/email/email.service';
import { renderEscrowReleasedEmail } from '@core/email/templates/escrow-released.template';
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
    const { error: updErr } = await this.supabase.client
      .from('notifications')
      .update({ email_status: status })
      .eq('id', row.id);
    if (updErr) {
      this.logger.error(
        `update email_status for ${row.id} failed: ${updErr.message}`
      );
    }
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

  async listForUser(userId: string, limit: number): Promise<unknown[]> {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select(
        'id, type, escrow_id, title, body, data, read_at, email_status, created_at'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      throw new Error(
        `Failed to load notifications for ${userId}: ${error.message}`
      );
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
      throw new Error(
        `Failed to count notifications for ${userId}: ${error.message}`
      );
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
      throw new Error(
        `Failed to mark notification ${id} read: ${error.message}`
      );
    }
    return data;
  }
}
