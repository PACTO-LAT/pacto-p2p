import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
