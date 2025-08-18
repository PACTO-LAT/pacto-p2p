import { NextResponse } from 'next/server';
import {
  ensureMockEnabled,
  listPublicMerchants,
} from '@/lib/mocks/merchant.fixtures';
import type { Merchant } from '@/lib/types/merchant';

export async function GET() {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const all: Merchant[] = listPublicMerchants();
  return NextResponse.json(all);
}
