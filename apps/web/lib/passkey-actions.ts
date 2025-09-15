export async function submitTransactionXDR(xdr: string, fee?: number) {
  const res = await fetch('/api/passkeys/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xdr, fee }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLaunchtubeCredits(): Promise<{ credits: string }> {
  const res = await fetch('/api/passkeys/credits', {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


