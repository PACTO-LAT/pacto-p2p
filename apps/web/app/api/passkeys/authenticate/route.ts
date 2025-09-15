import { NextResponse } from 'next/server';
import { isPasskeyServerConfigured, getPasskeyServer } from '@/lib/passkeyServer';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body as { userId?: string };

    if (!isPasskeyServerConfigured()) {
      return NextResponse.json(
        { error: 'Passkey server not configured' },
        { status: 500 }
      );
    }

    const server = getPasskeyServer();
    // This mirrors the kit connectWallet server-side helpers: resolve contract from a keyId/publicKey/policy
    // Here we allow a basic reverse lookup only
    const contractId = await server.getContractId({ keyId: undefined, publicKey: undefined });
    return NextResponse.json({ ok: true, userId: userId ?? null, contractId });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


