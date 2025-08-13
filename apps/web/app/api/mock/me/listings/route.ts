import { NextResponse } from 'next/server';
import {
  createMyListing,
  ensureMockEnabled,
  getMyListings,
} from '@/lib/mocks/merchant.fixtures';

export async function GET() {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  return NextResponse.json(getMyListings());
}

export async function POST(req: Request) {
  try {
    ensureMockEnabled();
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 404 });
  }
  const body = (await req.json()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const created = createMyListing(body);
  return NextResponse.json(created);
}
