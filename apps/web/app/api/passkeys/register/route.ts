import { NextResponse } from 'next/server';
import { isPasskeyServerConfigured, getPasskeyServer } from '@/lib/passkeyServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userInfo } = body as {
      userId: string;
      userInfo?: Record<string, unknown>;
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (!isPasskeyServerConfigured()) {
      return NextResponse.json(
        { error: 'Passkey server not configured' },
        { status: 500 }
      );
    }

    // Create or discover a contract id to associate with this user
    const server = getPasskeyServer();
    const contractId = await server.getContractId({ keyId: userInfo?.keyId as string | undefined, publicKey: userInfo?.publicKey as string | undefined });

    return NextResponse.json({ ok: true, userId, contractId });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


