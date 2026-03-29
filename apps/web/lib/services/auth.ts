import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import { normalizeUserFromDb } from '@/lib/utils/normalize-user';
import { EnhancedAuthService } from './enhanced-auth.service';

// biome-ignore lint/complexity/noStaticOnlyClass: Service class pattern for auth operations
export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    // Profile is automatically created by the handle_new_user trigger on auth.users
    // No need to verify here — user is not yet authenticated (email confirmation required)
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signInWithProvider(provider: 'google' | 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Profile exists — return it
    if (data) return normalizeUserFromDb(data as Record<string, unknown>);

    // Profile missing — create it once from the current session.
    // (Users created before the handle_new_user trigger won't have a public.users row.)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || session.user.id !== userId) return null;

    // Only auto-create when we are looking up our own profile
    const email = session.user.email ?? `${userId}@auth.local`;
    await supabase.from('users').insert({
      id: userId,
      email,
      reputation_score: 0,
      total_trades: 0,
      total_volume: 0,
    });
    // Ignore errors: 23505 = row already exists (race condition), anything else we silently skip

    const { data: created } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return created ? normalizeUserFromDb(created as Record<string, unknown>) : null;
  }

  static async getUserByWallet(stellarAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('stellar_address', stellarAddress)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return normalizeUserFromDb(data as Record<string, unknown>) ?? null;
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    // Use the enhanced service for profile updates
    return EnhancedAuthService.updateUserProfile(userId, updates);
  }

  /** Direct avatar update - bypasses full validation for storage URLs */
  static async updateAvatarUrl(
    userId: string,
    avatarUrl: string
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return (
      normalizeUserFromDb(data as Record<string, unknown>) ?? (data as User)
    );
  }

  static async linkWalletToUser(userId: string, stellarAddress: string) {
    // Check if wallet is already linked to another user
    const existingUser = await this.getUserByWallet(stellarAddress);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('This wallet is already linked to another account');
    }

    // Update user profile with wallet address
    return this.updateUserProfile(userId, {
      stellar_address: stellarAddress,
    });
  }

  private static async createUserProfile(userId: string, email: string) {
    try {
      const { error } = await supabase.from('users').insert({
        id: userId,
        email,
        reputation_score: 0,
        total_trades: 0,
        total_volume: 0,
      });

      if (error) {
        // If it's a unique constraint violation, profile might already exist (from trigger)
        if (error.code === '23505') {
          console.log(
            'User profile already exists (likely created by trigger)'
          );
          return;
        }
        // Log detailed error information
        console.error('Profile creation error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId,
          email,
        });
        throw new Error(error.message);
      }
    } catch (err) {
      // Enhanced error logging
      const errorDetails = {
        error: err,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorString: JSON.stringify(err, Object.getOwnPropertyNames(err)),
        userId,
        email,
      };
      console.error('Profile creation failed:', errorDetails);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
}
