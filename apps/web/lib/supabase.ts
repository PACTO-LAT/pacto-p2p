import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const MISSING_PUBLIC_ENV_MESSAGE =
  'Supabase env is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
  'NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local.';

function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
}

function requireSupabasePublicEnv() {
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    throw new Error(MISSING_PUBLIC_ENV_MESSAGE);
  }
  return { url, anonKey };
}

let cachedPublicClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedPublicClient) {
    const { url, anonKey } = requireSupabasePublicEnv();
    cachedPublicClient = createClient(url, anonKey);
  }
  return cachedPublicClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as Record<PropertyKey, unknown>)[prop];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
}) as SupabaseClient;

// Server-side client for admin operations
export const createServerClient = () => {
  const { url, anonKey } = requireSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not work. ' +
        'Set this environment variable for admin functionality.'
    );
    // Fallback to anon key (limited functionality)
    return createClient(url, anonKey);
  }

  return createClient(url, serviceRoleKey);
};
