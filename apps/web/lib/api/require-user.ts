import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Verifies the request comes from an authenticated user.
 * Reads the Bearer token from the Authorization header.
 * Returns the user id if authenticated, or a 401 NextResponse if not.
 */
export async function requireUser(
  request: NextRequest
): Promise<{ id: string; email: string | undefined } | NextResponse> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { id: user.id, email: user.email ?? undefined };
}
