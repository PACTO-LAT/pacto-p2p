export function ensureMockEnabledResponse(): Response | null {
  if (process.env.NEXT_PUBLIC_USE_MOCK !== '1') {
    return new Response('Mock API disabled. Set NEXT_PUBLIC_USE_MOCK=1', {
      status: 404,
    });
  }
  return null;
}
