import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase';

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  use_case: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function generateOtp(): string {
  const value = Math.floor(Math.random() * 1_000_000);
  return value.toString().padStart(6, '0');
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const supabase = createServerClient();
    const { error } = await supabase.from('waitlist_submissions')
      .upsert({
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        role: input.role ?? null,
        country: input.country ?? null,
        source: input.source ?? null,
        use_case: input.use_case ?? null,
        notes: input.notes ?? null,
        otp,
        otp_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Still return 200, but warn in payload if missing API key
      return NextResponse.json({ ok: true, notice: 'Email not sent: RESEND_API_KEY not configured', otpSent: false });
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


