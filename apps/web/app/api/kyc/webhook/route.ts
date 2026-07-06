import crypto from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type KycStatus = 'verified' | 'pending' | 'rejected';

function mapDiditStatus(status: string): KycStatus {
  if (status === 'Approved') return 'verified';
  if (status === 'Declined') return 'rejected';
  return 'pending';
}

function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}

function verifyTimestamp(timestampHeader: string | null): boolean {
  if (!timestampHeader) return false;

  const timestamp = Number.parseInt(timestampHeader, 10);
  if (Number.isNaN(timestamp)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - timestamp) <= 300;
}

export async function POST(request: NextRequest) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'webhook_not_configured' },
      { status: 401 }
    );
  }

  const signature = request.headers.get('X-Signature');
  const timestamp = request.headers.get('X-Timestamp');

  if (!verifyTimestamp(timestamp)) {
    return NextResponse.json({ error: 'invalid_timestamp' }, { status: 401 });
  }

  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: {
    session_id?: string;
    status?: string;
    vendor_data?: string;
    webhook_type?: string;
    decision?: unknown;
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { session_id, status, vendor_data } = payload;
  if (!session_id || !status) {
    return NextResponse.json({ ok: true });
  }

  const mappedStatus = mapDiditStatus(status);
  const supabase = createAdminClient();

  let user: { id: string; kyc_status: string | null } | null = null;

  if (vendor_data) {
    const { data } = await supabase
      .from('users')
      .select('id, kyc_status')
      .eq('id', vendor_data)
      .maybeSingle();
    user = data;
  }

  if (!user) {
    const { data } = await supabase
      .from('users')
      .select('id, kyc_status')
      .eq('kyc_session_id', session_id)
      .maybeSingle();
    user = data;
  }

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (user.kyc_status === mappedStatus) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    kyc_status: mappedStatus,
    updated_at: now,
  };

  if (mappedStatus === 'verified') {
    update.kyc_verified_at = now;
  }

  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
