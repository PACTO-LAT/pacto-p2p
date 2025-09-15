import { NextResponse } from 'next/server';
import { isPasskeyServerConfigured, getPasskeyServer } from '@/lib/passkeyServer';

export async function POST(req: Request) {
  try {
    if (!isPasskeyServerConfigured()) {
      return NextResponse.json({ error: 'Passkey server not configured' }, { status: 500 });
    }

    const { xdr, fee } = (await req.json()) as { xdr: string; fee?: number };
    if (!xdr) {
      return NextResponse.json({ error: 'Missing xdr' }, { status: 400 });
    }

    const server = getPasskeyServer();
    const result = await server.send(xdr, fee);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


