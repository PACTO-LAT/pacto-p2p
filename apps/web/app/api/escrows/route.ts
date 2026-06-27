import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const res = await backendFetch(`/v1/escrows/users/${auth.id}`);
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
