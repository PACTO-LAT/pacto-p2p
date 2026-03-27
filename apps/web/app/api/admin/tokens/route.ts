import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdminService } from '@/lib/services/admin';
import { requireAdmin } from '@/lib/utils/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await AdminService.getTokenOperations();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { operation, token, amount, address, memo } = await request.json();
    
    const auditContext = {
      ipAddress: auth.ipAddress,
      userAgent: auth.userAgent,
    };

    let data;
    if (operation === 'mint') {
      data = await AdminService.mintTokens(
        token,
        amount,
        address,
        memo,
        auth.userId,
        auditContext
      );
    } else if (operation === 'burn') {
      data = await AdminService.burnTokens(
        token,
        amount,
        address,
        memo,
        auth.userId,
        auditContext
      );
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}