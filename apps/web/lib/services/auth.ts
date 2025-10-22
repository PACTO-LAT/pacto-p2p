import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await AuthService.createUserProfile(data.user.id, email);
    }

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
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }

    return data;
  }

  static async getUserByWallet(stellarAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('stellar_address', stellarAddress)
      .single();

    if (error) {
      const e = error as unknown as {
        code?: string;
        details?: string;
        message?: string;
      };
      if (e.code === 'PGRST116') return null;
      // On some PostgREST versions, .single() without rows throws 406 / PGRST116
      if (e.message?.includes('No rows found')) return null;
      // If multiple rows, fall back to first
      if (e.details?.includes('Results contain 0')) return null;
    }
    return (data as unknown as User) ?? null;
  }

  static async ensureUserProfileByWallet(
    stellarAddress: string
  ): Promise<User> {
    // Try to find existing user by wallet
    const existing = await this.getUserByWallet(stellarAddress);
    if (existing) return existing;

    // Create a minimal profile; email is synthetic for type compatibility
    const syntheticEmail = `${stellarAddress}@wallet.local`;
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: syntheticEmail,
        stellar_address: stellarAddress,
        reputation_score: 0,
        total_trades: 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as User;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private static async createUserProfile(userId: string, email: string) {
    const { error } = await supabase.from('users').insert({
      id: userId,
      email,
      reputation_score: 0,
      total_trades: 0,
    });

    if (error) throw error;
  }
}
