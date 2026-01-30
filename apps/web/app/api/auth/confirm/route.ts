import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Only allow in development
    const isDevelopment =
      process.env.NEXT_PUBLIC_ENV === 'development' ||
      process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'Auto-confirmation only available in development' },
        { status: 403 }
      );
    }

    const serverClient = createServerClient();
    
    // Check if service role key is available (required for admin operations)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        'SUPABASE_SERVICE_ROLE_KEY is not set. Cannot confirm user email. ' +
        'Set SUPABASE_SERVICE_ROLE_KEY in your environment variables for admin operations.'
      );
      return NextResponse.json(
        { 
          error: 'Service role key not configured. Admin operations require SUPABASE_SERVICE_ROLE_KEY environment variable.',
          hint: 'This endpoint requires admin privileges. Set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.'
        },
        { status: 503 }
      );
    }

    const { error } = await serverClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error('Failed to confirm user:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error confirming user:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
