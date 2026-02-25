import { z } from 'zod';

// ISO 3166-1 alpha-2 country codes validation
const countryCodeRegex = /^[A-Z]{2}$/;

// Phone number validation (international format)
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Username validation (alphanumeric, underscores, hyphens, 3-30 chars)
const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

// Stellar address validation (56 characters, starts with G)
const stellarAddressRegex = /^G[A-Z2-7]{55}$/;

// Notification settings schema
export const notificationSettingsSchema = z.object({
  email_trades: z.boolean(),
  email_escrows: z.boolean(),
  push_notifications: z.boolean(),
  sms_notifications: z.boolean(),
});

// Security settings schema
export const securitySettingsSchema = z.object({
  two_factor_enabled: z.boolean(),
  login_notifications: z.boolean(),
});

// Bank account schema
const bankAccountSchema = z.object({
  bank_iban: z.string().min(1, 'IBAN is required'),
  bank_name: z.string().min(1, 'Bank name is required'),
  bank_account_holder: z.string().min(1, 'Account holder name is required'),
});

// Payment methods schema
export const paymentMethodsSchema = z.object({
  sinpe_number: z.string().optional(),
  preferred_method: z.enum(['sinpe', 'bank_transfer']),
  bank_accounts: z.array(bankAccountSchema).optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  username: z
    .string()
    .regex(usernameRegex, 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens')
    .max(50, 'Username must be less than 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatar_url: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format. Use international format (e.g., +1234567890)')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .regex(countryCodeRegex, 'Country must be a valid ISO 3166-1 alpha-2 code (e.g., US, CR, MX)')
    .length(2, 'Country code must be exactly 2 characters')
    .optional()
    .or(z.literal('')),
  stellar_address: z
    .string()
    .regex(stellarAddressRegex, 'Invalid Stellar address format')
    .optional()
    .or(z.literal('')),
  kyc_status: z.enum(['pending', 'verified', 'rejected']).optional(),
  notifications: notificationSettingsSchema.optional(),
  security: securitySettingsSchema.optional(),
  payment_methods: paymentMethodsSchema.optional(),
});

// Type inference from schema
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Validation function with detailed error messages
export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data);
}

// Helper to format validation errors for user display
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.errors
    .map((err) => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    })
    .join('; ');
}
