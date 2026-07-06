import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';

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

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const supabase = createAdminClient();
    const { error } = await supabase.from('waitlist_submissions').upsert(
      {
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        role: input.role ?? null,
        country: input.country ?? null,
        source: input.source ?? null,
        use_case: input.use_case ?? null,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
