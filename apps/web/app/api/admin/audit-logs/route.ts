import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/audit';
import type { AuditAction, AuditTargetType } from '@/lib/types/audit';
import { requireAdmin } from '@/lib/utils/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('admin_user_id') || undefined;
    const action = searchParams.get('action') || undefined;
    const targetType = searchParams.get('target_type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [logs, total] = await Promise.all([
      AuditService.getAuditLogs({
        adminUserId,
        action: action as AuditAction | undefined,
        targetType: targetType as AuditTargetType | undefined,
        limit,
        offset,
      }),
      AuditService.getAuditLogsCount({
        adminUserId,
        action: action as AuditAction | undefined,
        targetType: targetType as AuditTargetType | undefined,
      }),
    ]);

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
