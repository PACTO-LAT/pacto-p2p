import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('waitlist_submissions')
      .select('id, otp, otp_expires_at')
      .eq('email', input.email)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data || !data.otp || data.otp !== input.otp) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const expiresAt = data.otp_expires_at ? new Date(data.otp_expires_at as unknown as string) : null;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('waitlist_submissions')
      .update({
        verified_at: new Date().toISOString(),
        otp: null,
        otp_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


