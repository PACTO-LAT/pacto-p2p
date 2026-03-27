import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Verifies the request comes from an authenticated admin user.
 * Reads the Bearer token from the Authorization header.
 * Returns the user if admin, or a 401/403 NextResponse if not.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ userId: string; ipAddress?: string; userAgent?: string } | NextResponse> {
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

  const { data: profile } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Extract request metadata for audit logging
  const ipAddress = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined;
  
  const userAgent = request.headers.get('user-agent') || undefined;

  return { 
    userId: user.id,
    ipAddress,
    userAgent
  };
}
