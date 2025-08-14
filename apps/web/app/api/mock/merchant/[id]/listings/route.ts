import { NextResponse } from 'next/server';
import {
  ensureMockEnabled,
  getListings,
  getMerchant,
} from '@/lib/mocks/merchant.fixtures';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const { id } = await context.params;
  const merchant = getMerchant(id);
  if (!merchant) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(getListings(id));
}
