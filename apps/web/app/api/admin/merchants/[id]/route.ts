import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdminService } from '@/lib/services/admin';
import { requireAdmin } from '@/lib/utils/require-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { action } = await request.json();
    let data;
    if (action === 'approve') data = await AdminService.approveMerchant(params.id);
    else if (action === 'reject') data = await AdminService.rejectMerchant(params.id);
    else if (action === 'revoke') data = await AdminService.revokeMerchant(params.id);
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
