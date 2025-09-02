import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

type AccessCode = {
  id: string;
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number | null;
};

const bodySchema = z.object({
  code: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = bodySchema.parse(json);

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('access_codes')
      .select('id, active, expires_at, max_uses, used_count')
      .eq('code', input.code)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
    if (!data.active) {
      return NextResponse.json({ error: 'Code is inactive' }, { status: 400 });
    }

    const expiresAt = (data as AccessCode).expires_at
      ? new Date((data as AccessCode).expires_at as string)
      : null;
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    const maxUses = (data as AccessCode).max_uses as number | null;
    const usedCount = (data as AccessCode).used_count as number | null;
    if (maxUses != null && usedCount != null && usedCount >= maxUses) {
      return NextResponse.json(
        { error: 'Code usage limit reached' },
        { status: 400 }
      );
    }

    // Increment usage counter if applicable
    if (maxUses != null) {
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({ used_count: (usedCount ?? 0) + 1 })
        .eq('id', (data as AccessCode).id);
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
