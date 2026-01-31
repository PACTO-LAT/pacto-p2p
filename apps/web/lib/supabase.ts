import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function getValidSupabaseUrl(): string {
  if (!rawUrl || rawUrl.includes('your_supabase')) {
    return 'https://placeholder.supabase.co';
  }
  try {
    new URL(rawUrl);
    return rawUrl;
  } catch {
    return 'https://placeholder.supabase.co';
  }
}

function getValidAnonKey(): string {
  if (!rawKey || rawKey.includes('your_supabase') || rawKey === 'your_supabase_anon_key') {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.placeholder';
  }
  return rawKey;
}

const supabaseUrl = getValidSupabaseUrl();
const supabaseAnonKey = getValidAnonKey();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not work. ' +
      'Set this environment variable for admin functionality.'
    );
    // Fallback to anon key (limited functionality)
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
};
