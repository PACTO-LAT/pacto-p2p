import 'server-only';

export async function backendFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const baseUrl = process.env.BACKEND_URL;
  const key = process.env.INTERNAL_API_KEY;
  if (!baseUrl || !key) {
    throw new Error('BACKEND_URL / INTERNAL_API_KEY are not configured');
  }
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-internal-key': key,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
}
