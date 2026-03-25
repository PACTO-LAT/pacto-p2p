import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
      'to your own Supabase project (or local Supabase CLI project).'
  );
}

// Browser client — stores session in cookies instead of localStorage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations that require the service role key
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will not work. ' +
        'Set this environment variable for admin functionality.'
    );
    return createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return createClient(supabaseUrl!, serviceRoleKey);
};
