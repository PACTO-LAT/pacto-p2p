import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin';
import { requireAdmin } from '@/lib/utils/require-admin';

const VALID_KYC_STATUSES = ['verified', 'pending', 'rejected'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { kyc_status: kycStatus } = body;

    if (
      typeof kycStatus !== 'string' ||
      !VALID_KYC_STATUSES.includes(
        kycStatus as (typeof VALID_KYC_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid kyc_status' },
        { status: 400 }
      );
    }

    const data = await AdminService.updateUserKycStatus(
      id,
      kycStatus as (typeof VALID_KYC_STATUSES)[number]
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
