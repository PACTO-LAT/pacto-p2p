import { supabase } from '@/lib/supabase';

/**
 * Fire-and-forget trigger to recompute stats/reputation after a trade reaches
 * a terminal state (completion or dispute). Best-effort only: it must never
 * block or throw into the trade flow. The Phase 3 nightly reconcile is the
 * backstop if this call fails.
 *
 * Pass the ids of the parties to recompute (e.g. buyer + seller). The route
 * only honours the provided ids if the caller is one of them (bounded,
 * idempotent, no data leak); otherwise it falls back to the caller's id.
 *
 * Must be invoked AFTER the trade's DB status has been persisted (e.g. marked
 * `completed`), so the backend recompute reads fresh data rather than stale
 * ('pending') rows.
 */
export async function triggerStatsRecompute(userIds?: string[]) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch('/api/stats/recompute', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({ userIds: userIds ?? [] }),
    });
  } catch {
    // best-effort: nightly reconcile (Phase 3) is the backstop
  }
}
