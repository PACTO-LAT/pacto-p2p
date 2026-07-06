import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!auth.email) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('waitlist_submissions')
    .select('id, verified_at')
    .ilike('email', auth.email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: 'not_on_waitlist' }, { status: 404 });
  }

  if (data.verified_at) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('waitlist_submissions')
    .update({
      verified_at: now,
      updated_at: now,
    })
    .eq('id', data.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
