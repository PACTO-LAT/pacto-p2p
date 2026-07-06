import { type NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/api/require-user';
import { createAdminClient } from '@/lib/supabase';

function getOrigin(request: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const apiKey = process.env.DIDIT_API_KEY;
  const workflowId = process.env.DIDIT_WORKFLOW_ID;
  if (!apiKey || !workflowId) {
    return NextResponse.json({ error: 'kyc_not_configured' }, { status: 503 });
  }

  const origin = getOrigin(request);
  const callback = `${origin}/dashboard/profile?kyc=done`;

  const diditRes = await fetch('https://verification.didit.me/v3/session/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      vendor_data: auth.id,
      callback,
    }),
  });

  if (!diditRes.ok) {
    return NextResponse.json({ error: 'didit_error' }, { status: 502 });
  }

  const data = (await diditRes.json()) as {
    session_id?: string;
    url?: string;
  };

  if (!data.session_id || !data.url) {
    return NextResponse.json({ error: 'didit_error' }, { status: 502 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('users')
    .update({
      kyc_session_id: data.session_id,
      kyc_provider: 'didit',
      updated_at: new Date().toISOString(),
    })
    .eq('id', auth.id);

  if (error) {
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }

  return NextResponse.json({ url: data.url }, { status: 201 });
}
