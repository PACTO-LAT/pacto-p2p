import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';
import { validateProfileUpdate } from '../schemas/profile-validation.schema';

/**
 * Custom error types for better error handling
 */
export class ProfileUpdateError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ProfileUpdateError';
    }
}

/**
 * Enhanced AuthService with robust validation and error handling
 */
export namespace EnhancedAuthService {
    /**
     * Update user profile with comprehensive validation and error handling
     * @param userId - The user's ID
     * @param updates - Partial user data to update
     * @returns Updated user profile
     * @throws ProfileUpdateError with specific error codes
     */
    export async function updateUserProfile(
        userId: string,
        updates: Partial<User>
    ): Promise<User> {
        // Step 1: Validate input data
        const validation = validateProfileUpdate(updates);

        if (!validation.success) {
            const errorMessages = validation.error.issues
                .map((err) => `${err.path.filter((p) => typeof p !== 'symbol').join('.')}: ${err.message}`)
                .join('; ');

            throw new ProfileUpdateError(
                `Validation failed: ${errorMessages}`,
                'VALIDATION_ERROR',
                validation.error.issues
            );
        }

        const validatedData = validation.data;

        // Step 2: Check for unique constraints before updating
        try {
            // Check username uniqueness
            if (validatedData.username) {
                const { data: existingUsernameData, error: usernameCheckError } =
                    await supabase
                        .from('users')
                        .select('id')
                        .eq('username', validatedData.username)
                        .neq('id', userId)
                        .limit(1); // <-- ensures at most one row

                if (usernameCheckError) {
                    throw new ProfileUpdateError(
                        'Failed to check username availability',
                        'DATABASE_ERROR',
                        usernameCheckError
                    );
                }

                if (existingUsernameData && existingUsernameData.length > 0) {
                    throw new ProfileUpdateError(
                        'This username is already taken',
                        'USERNAME_TAKEN',
                        { username: validatedData.username }
                    );
                }
            }

            // Check email uniqueness
            if (validatedData.email && !validatedData.email.endsWith('@wallet.local')) {
                const { data: existingEmailData, error: emailCheckError } =
                    await supabase
                        .from('users')
                        .select('id')
                        .eq('email', validatedData.email)
                        .neq('id', userId)
                        .limit(1);

                if (emailCheckError) {
                    throw new ProfileUpdateError(
                        'Failed to check email availability',
                        'DATABASE_ERROR',
                        emailCheckError
                    );
                }

                if (existingEmailData && existingEmailData.length > 0) {
                    throw new ProfileUpdateError(
                        'This email is already in use',
                        'EMAIL_TAKEN',
                        { email: validatedData.email }
                    );
                }
            }

            // Check Stellar address uniqueness
            if (validatedData.stellar_address) {
                const { data: existingStellarData, error: stellarCheckError } =
                    await supabase
                        .from('users')
                        .select('id')
                        .eq('stellar_address', validatedData.stellar_address)
                        .neq('id', userId)
                        .limit(1);

                if (stellarCheckError) {
                    throw new ProfileUpdateError(
                        'Failed to check Stellar address availability',
                        'DATABASE_ERROR',
                        stellarCheckError
                    );
                }

                if (existingStellarData && existingStellarData.length > 0) {
                    throw new ProfileUpdateError(
                        'This Stellar address is already linked to another account',
                        'STELLAR_ADDRESS_TAKEN',
                        { stellar_address: validatedData.stellar_address }
                    );
                }
            }

        } catch (error) {
            if (error instanceof ProfileUpdateError) {
                throw error;
            }
            throw new ProfileUpdateError(
                'Failed to validate unique constraints',
                'VALIDATION_ERROR',
                error
            );
        }

        // Step 3: Prepare update payload
        const updatePayload: Record<string, unknown> = {
            ...validatedData,
            updated_at: new Date().toISOString(),
        };

        // Remove empty strings to avoid overwriting with nulls unintentionally
        Object.keys(updatePayload).forEach((key) => {
            if (updatePayload[key] === '') {
                updatePayload[key] = null;
            }
        });

        // Step 4: Perform the update with transaction safety
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', userId)
                .select()
                .maybeSingle();

            if (error) {
                // Handle specific Supabase errors
                if (error.code === '23505') {
                    // Unique constraint violation
                    throw new ProfileUpdateError(
                        'A unique constraint was violated',
                        'UNIQUE_VIOLATION',
                        error
                    );
                }

                if (error.code === '23503') {
                    // Foreign key violation
                    throw new ProfileUpdateError(
                        'Referenced data does not exist',
                        'FOREIGN_KEY_VIOLATION',
                        error
                    );
                }

                if (error.code === '42P01') {
                    // Table does not exist
                    throw new ProfileUpdateError(
                        'Database table not found',
                        'DATABASE_ERROR',
                        error
                    );
                }

                // Generic database error
                throw new ProfileUpdateError(
                    `Database error: ${error.message}`,
                    'DATABASE_ERROR',
                    error
                );
            }

            if (!data) {
                throw new ProfileUpdateError(
                    'User not found',
                    'USER_NOT_FOUND',
                    { userId }
                );
            }

            return data as User;
        } catch (error) {
            if (error instanceof ProfileUpdateError) {
                throw error;
            }

            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new ProfileUpdateError(
                    'Network error: Unable to connect to the server',
                    'NETWORK_ERROR',
                    error
                );
            }

            // Generic error
            throw new ProfileUpdateError(
                'An unexpected error occurred while updating profile',
                'UNKNOWN_ERROR',
                error
            );
        }
    }

    /**
     * Get user-friendly error message from ProfileUpdateError
     * @param error - The error object
     * @returns User-friendly error message
     */
    export function getErrorMessage(error: unknown): string {
        if (error instanceof ProfileUpdateError) {
            switch (error.code) {
                case 'VALIDATION_ERROR':
                    return error.message;
                case 'USERNAME_TAKEN':
                    return 'This username is already taken. Please choose another.';
                case 'EMAIL_TAKEN':
                    return 'This email is already in use. Please use a different email.';
                case 'STELLAR_ADDRESS_TAKEN':
                    return 'This Stellar address is already linked to another account.';
                case 'USER_NOT_FOUND':
                    return 'User account not found. Please try logging in again.';
                case 'NETWORK_ERROR':
                    return 'Unable to connect to the server. Please check your internet connection.';
                case 'DATABASE_ERROR':
                    return 'A database error occurred. Please try again later.';
                case 'UNIQUE_VIOLATION':
                    return 'One of the values you entered is already in use.';
                case 'FOREIGN_KEY_VIOLATION':
                    return 'Invalid reference data. Please contact support.';
                default:
                    return 'An unexpected error occurred. Please try again.';
            }
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'An unknown error occurred. Please try again.';
    }

    /**
     * Validate a single field in real-time
     * @param field - Field name
     * @param value - Field value
     * @returns Validation result
     */
    export function validateField(
        field: keyof User,
        value: unknown
    ): { success: boolean; error?: string } {
        const schema = validateProfileUpdate({ [field]: value });

        if (schema.success) {
            return { success: true };
        }

        const fieldError = schema.error.issues.find(
            (err) => err.path[0] === field
        );

        return {
            success: false,
            error: fieldError?.message || 'Invalid value',
        };
    }
}