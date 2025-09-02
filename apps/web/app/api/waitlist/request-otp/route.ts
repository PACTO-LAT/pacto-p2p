import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase';

const bodySchema = z.object({
  email: z.string().email(),
});

function generateOtp(): string {
  const value = Math.floor(Math.random() * 1_000_000);
  return value.toString().padStart(6, '0');
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const supabase = createServerClient();
    const { data: existing, error: fetchError } = await supabase
      .from('waitlist_submissions')
      .select('id, email')
      .eq('email', input.email)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Email not found. Please join the waitlist.' },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const { error: updateError } = await supabase
      .from('waitlist_submissions')
      .update({
        otp,
        otp_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        notice: 'Email not sent: RESEND_API_KEY not configured',
        otpSent: false,
      });
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Pacto <no-reply@pacto.app>',
      to: input.email,
      subject: 'Your Pacto verification code',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });

    return NextResponse.json({ ok: true, otpSent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
