import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";

// biome-ignore lint/complexity/noStaticOnlyClass: Service class pattern for auth operations
export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    // Auto-confirm email in development mode
    const isDevelopment =
      process.env.NEXT_PUBLIC_ENV === "development" ||
      process.env.NODE_ENV === "development";

    if (data.user && isDevelopment) {
      try {
        // Call API route to auto-confirm user (server-side)
        const response = await fetch("/api/auth/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        });

        if (response.ok) {
          console.log("User auto-confirmed in development mode");

          // After confirmation, sign in to establish a session
          // Wait a moment for confirmation to propagate
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Sign in to get a session
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) {
            console.warn(
              "Failed to sign in after auto-confirmation:",
              signInError,
            );
            // Return original signup data - user can sign in manually
            return data;
          }

          // Return the sign-in data which includes the session
          if (signInData) {
            return signInData;
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn("Failed to auto-confirm user:", errorData);
          // Don't throw - user is created, they can confirm via email
        }
      } catch (confirmErr) {
        console.warn("Error during auto-confirmation:", confirmErr);
        // Don't throw - user is created, they can confirm via email
      }
    }

    // User profile is automatically created by database trigger (handle_new_user)
    // The trigger runs AFTER INSERT on auth.users and creates the profile
    // Wait a moment for trigger to execute, then verify profile exists
    if (data.user) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify profile was created by trigger
      try {
        const profile = await this.getUserProfile(data.user.id);
        if (!profile) {
          console.warn(
            "Profile not created by trigger, attempting manual creation",
          );
          // Fallback: try to create profile manually
          await this.createUserProfile(data.user.id, email);
        }
      } catch (profileError) {
        // Log the error but don't fail signup - user is created in auth
        console.error("Profile verification/creation error:", {
          error: profileError,
          userId: data.user.id,
          email,
          errorString: JSON.stringify(profileError),
          errorMessage:
            profileError instanceof Error
              ? profileError.message
              : String(profileError),
        });
        // Don't throw - user is created in auth, profile can be created later
      }
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

  static async signInWithProvider(provider: "google" | "github") {
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
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }

    return data;
  }

  static async getUserByWallet(stellarAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("stellar_address", stellarAddress)
      .single();

    if (error) {
      const e = error as unknown as {
        code?: string;
        details?: string;
        message?: string;
      };
      if (e.code === "PGRST116") return null;
      // On some PostgREST versions, .single() without rows throws 406 / PGRST116
      if (e.message?.includes("No rows found")) return null;
      // If multiple rows, fall back to first
      if (e.details?.includes("Results contain 0")) return null;
    }
    return (data as unknown as User) ?? null;
  }

  static async ensureUserProfileByWallet(
    stellarAddress: string,
  ): Promise<User> {
    // Try to find existing user by wallet
    const existing = await this.getUserByWallet(stellarAddress);
    if (existing) return existing;

    // Create a minimal profile; email is synthetic for type compatibility
    const syntheticEmail = `${stellarAddress}@wallet.local`;
    const { data, error } = await supabase
      .from("users")
      .insert({
        email: syntheticEmail,
        stellar_address: stellarAddress,
        reputation_score: 0,
        total_trades: 0,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as unknown as User;
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Upload user avatar to Supabase Storage and update profile
   * @param userId - The user's ID
   * @param file - The image file to upload
   * @returns The public URL of the uploaded avatar
   */
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${userId}-${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload new avatar file FIRST
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update database with new avatar URL
    try {
      await this.updateUserProfile(userId, {
        avatar_url: publicUrl,
      });
    } catch (error) {
      // Remove the just-uploaded file since DB update failed
      await supabase.storage.from("avatars").remove([filePath]);
      throw error;
    }

    // Delete old avatars AFTER successful upload and DB update
    try {
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(userId);

      if (existingFiles && existingFiles.length > 1) {
        // Keep the new one, remove all others
        const filesToRemove = existingFiles
          .filter((f) => f.name !== fileName)
          .map((f) => `${userId}/${f.name}`);

        if (filesToRemove.length > 0) {
          await supabase.storage.from("avatars").remove(filesToRemove);
        }
      }
    } catch (cleanupError) {
      // Log cleanup error but don't fail the operation - avatar was already uploaded
      console.warn("Cleanup of old avatars failed:", cleanupError);
    }

    return publicUrl;
  }

  static async linkWalletToUser(userId: string, stellarAddress: string) {
    // Check if wallet is already linked to another user
    const existingUser = await this.getUserByWallet(stellarAddress);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("This wallet is already linked to another account");
    }

    // Update user profile with wallet address
    return this.updateUserProfile(userId, {
      stellar_address: stellarAddress,
    });
  }

  private static async createUserProfile(userId: string, email: string) {
    try {
      const { error } = await supabase.from("users").insert({
        id: userId,
        email,
        reputation_score: 0,
        total_trades: 0,
        total_volume: 0,
      });

      if (error) {
        // If it's a unique constraint violation, profile might already exist (from trigger)
        if (error.code === "23505") {
          console.log(
            "User profile already exists (likely created by trigger)",
          );
          return;
        }
        // Log detailed error information
        console.error("Profile creation error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId,
          email,
        });
        throw error;
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
      console.error("Profile creation failed:", errorDetails);
      throw err;
    }
  }
}
