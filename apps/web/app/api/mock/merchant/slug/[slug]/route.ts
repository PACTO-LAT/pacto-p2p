import { NextResponse } from 'next/server';
import {
  ensureMockEnabled,
  findMerchantBySlug,
} from '@/lib/mocks/merchant.fixtures';

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const { slug } = await context.params;
  const merchant = findMerchantBySlug(slug);
  if (!merchant) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(merchant);
}
