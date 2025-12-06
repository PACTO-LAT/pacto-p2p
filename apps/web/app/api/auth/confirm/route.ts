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
