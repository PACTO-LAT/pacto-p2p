import { NextResponse } from 'next/server';
import {
  ensureMockEnabled,
  getMyMerchant,
  upsertMyMerchantProfile,
} from '@/lib/mocks/merchant.fixtures';

export async function GET() {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const me = getMyMerchant();
  if (!me) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(me);
}

export async function POST(req: Request) {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const body = (await req.json()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const updated = upsertMyMerchantProfile(body);
  return NextResponse.json(updated);
}
