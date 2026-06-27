import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { backendFetch } from '@/lib/services/backend';

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  const body = (await request.json().catch(() => null)) as {
    userIds?: unknown;
  } | null;
  const userIds = Array.isArray(body?.userIds)
    ? body.userIds.filter((v): v is string => typeof v === 'string')
    : [];
  // Allow recomputing the provided ids only if the caller is one of them, with
  // a small cap to avoid turning this into an arbitrary recompute oracle.
  const requested = [...new Set(userIds)];
  const targets =
    requested.includes(auth.id) && requested.length <= 4
      ? requested
      : [auth.id];
  const res = await backendFetch('/v1/internal/stats/recompute', {
    method: 'POST',
    body: JSON.stringify({ userIds: targets }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'backend_error' }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
