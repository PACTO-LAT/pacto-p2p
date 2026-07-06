import { z } from 'zod';
import type { PaymentMethodId } from '@/lib/payment-methods';

/**
 * ISO 3166-1 alpha-2 country codes validation
 */
const countryCodeRegex = /^[A-Z]{2}$/;

/**
 * E.164 phone number format (international)
 * Supports formats like: +1234567890, +12-345-678-90, etc.
 */
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Username validation rules:
 * - 3-50 characters
 * - Alphanumeric, hyphens, underscores only
 * - Cannot start or end with hyphen/underscore
 */
const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_-]{1,48}[a-zA-Z0-9])?$/;

/**
 * Stellar address validation (G... format, 56 characters)
 */
const stellarAddressRegex = /^G[A-Z2-7]{55}$/;

const paymentMethodIdSchema = z.enum([
  'sinpe',
  'spei',
  'pix',
  'nequi',
  'pse',
  'daviplata',
  'mercado_pago',
  'bank_transfer',
] satisfies [PaymentMethodId, ...PaymentMethodId[]]);

/**
 * Bank account schema for payment methods
 */
const bankAccountSchema = z.object({
  bank_identifier: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_holder: z.string().optional(),
});

/**
 * Payment methods schema
 */
export const paymentMethodsSchema = z.object({
  preferred_method: paymentMethodIdSchema.default('bank_transfer'),
  method_details: z.record(z.string(), z.string().optional()).default({}),
  bank_accounts: z.array(bankAccountSchema).default([]),
});

/**
 * Complete profile update schema
 * This validates all fields that can be updated via the Edit Profile form
 */
export const profileUpdateSchema = z.object({
  // Personal Information
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name is too long')
    .optional()
    .or(z.literal('')),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(
      usernameRegex,
      'Username can only contain letters, numbers, hyphens, and underscores'
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(
      phoneRegex,
      'Invalid phone number format (use E.164 format like +1234567890)'
    )
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .length(2, 'Country must be a 2-letter ISO code')
    .regex(
      countryCodeRegex,
      'Country must be a valid ISO 3166-1 alpha-2 code (e.g., US, CR)'
    )
    .optional()
    .or(z.literal('')),

  bio: z
    .string()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),

  avatar_url: z
    .string()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Avatar URL must be a valid URL'
    )
    .optional()
    .or(z.literal('')),

  stellar_address: z
    .string()
    .regex(stellarAddressRegex, 'Invalid Stellar address format')
    .optional()
    .or(z.literal('')),

  // KYC Status (read-only in most cases, but included for completeness)
  kyc_status: z.enum(['pending', 'verified', 'rejected']).optional(),

  // JSONB Fields
  payment_methods: paymentMethodsSchema.optional(),
});

/**
 * Partial profile update schema for flexible updates
 */
export const partialProfileUpdateSchema = profileUpdateSchema.partial();

/**
 * Type inference from schemas
 */
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PartialProfileUpdateInput = z.infer<
  typeof partialProfileUpdateSchema
>;
export type PaymentMethodsSettings = z.infer<typeof paymentMethodsSchema>;

/**
 * Validation helper function
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateProfileUpdate(data: unknown) {
  return partialProfileUpdateSchema.safeParse(data);
}

/**
 * Field-specific validators for real-time validation
 */
export const fieldValidators = {
  email: (value: string) => {
    if (!value) return { success: true };
    const result = z.string().email().safeParse(value);
    return {
      success: result.success,
      error: result.success ? undefined : 'Invalid email format',
    };
  },

  username: (value: string) => {
    if (!value) return { success: true };
    const result = z
      .string()
      .min(3)
      .max(50)
      .regex(usernameRegex)
      .safeParse(value);
    return {
      success: result.success,
      error: result.success
        ? undefined
        : 'Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores',
    };
  },

  phone: (value: string) => {
    if (!value) return { success: true };
    const result = z.string().regex(phoneRegex).safeParse(value);
    return {
      success: result.success,
      error: result.success
        ? undefined
        : 'Invalid phone number (use format: +1234567890)',
    };
  },

  country: (value: string) => {
    if (!value) return { success: true };
    const result = z
      .string()
      .length(2)
      .regex(countryCodeRegex)
      .safeParse(value);
    return {
      success: result.success,
      error: result.success
        ? undefined
        : 'Country must be a 2-letter ISO code (e.g., US, CR)',
    };
  },

  stellarAddress: (value: string) => {
    if (!value) return { success: true };
    const result = z.string().regex(stellarAddressRegex).safeParse(value);
    return {
      success: result.success,
      error: result.success
        ? undefined
        : 'Invalid Stellar address format (must start with G and be 56 characters)',
    };
  },
};
