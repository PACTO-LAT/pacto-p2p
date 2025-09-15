import { NextResponse } from 'next/server';
import { isPasskeyServerConfigured } from '@/lib/passkeyServer';

export async function GET() {
  try {
    if (!isPasskeyServerConfigured()) {
      return NextResponse.json({ error: 'Passkey server not configured' }, { status: 500 });
    }

    const url = process.env.NEXT_PUBLIC_launchtubeUrl as string | undefined;
    const jwt = process.env.PRIVATE_launchtubeJwt as string | undefined;
    if (!url || !jwt) {
      return NextResponse.json({ error: 'Missing Launchtube env' }, { status: 500 });
    }

    const infoUrl = new URL('/info', url).toString();
    const res = await fetch(infoUrl, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: res.status });
    }
    const credits = await res.text();
    return NextResponse.json({ credits });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


