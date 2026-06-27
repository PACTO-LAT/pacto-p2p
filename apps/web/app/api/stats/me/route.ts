import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const res = await backendFetch(`/v1/users/${auth.id}/stats`);
  if (res.status === 404) {
    return NextResponse.json(
      { reputation_score: 0, total_trades: 0, total_volume: 0 },
      { status: 200 }
    );
  }
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
