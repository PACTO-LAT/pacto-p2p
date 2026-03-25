import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdminService } from '@/lib/services/admin';
import { requireAdmin } from '@/lib/utils/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const data = await AdminService.getMerchantApplications(status);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
