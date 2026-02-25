import { describe, expect, it } from '@jest/globals';
import { validateProfileUpdate, formatValidationErrors } from '../profile';

describe('Profile Validation', () => {
  describe('validateProfileUpdate', () => {
    it('should accept valid profile data', () => {
      const validData = {
        email: 'user@example.com',
        full_name: 'John Doe',
        username: 'john_doe123',
        phone: '+15551234567',
        country: 'US',
        bio: 'Trading enthusiast',
      };

      const result = validateProfileUpdate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email');
      }
    });

    it('should reject invalid username format', () => {
      const invalidData = {
        username: 'ab', // Too short
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('3-30 characters');
      }
    });

    it('should reject invalid phone format', () => {
      const invalidData = {
        phone: '123', // Invalid format
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid phone number');
      }
    });

    it('should reject invalid country code', () => {
      const invalidData = {
        country: 'USA', // Should be 2 letters
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('ISO 3166-1 alpha-2');
      }
    });

    it('should reject bio longer than 500 characters', () => {
      const invalidData = {
        bio: 'a'.repeat(501),
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('500 characters');
      }
    });

    it('should accept valid Stellar address', () => {
      const validData = {
        stellar_address: 'GABC' + 'A'.repeat(52), // 56 chars starting with G
      };

      const result = validateProfileUpdate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Stellar address', () => {
      const invalidData = {
        stellar_address: 'INVALID',
      };

      const result = validateProfileUpdate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid Stellar address');
      }
    });

    it('should accept valid notification settings', () => {
      const validData = {
        notifications: {
          email_trades: true,
          email_escrows: false,
          push_notifications: true,
          sms_notifications: false,
        },
      };

      const result = validateProfileUpdate(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid payment methods', () => {
      const validData = {
        payment_methods: {
          sinpe_number: '12345678',
          preferred_method: 'sinpe' as const,
          bank_accounts: [
            {
              bank_iban: 'CR12345678901234567890',
              bank_name: 'Banco Nacional',
              bank_account_holder: 'John Doe',
            },
          ],
        },
      };

      const result = validateProfileUpdate(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty strings for optional fields', () => {
      const validData = {
        phone: '',
        country: '',
        avatar_url: '',
      };

      const result = validateProfileUpdate(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format multiple errors correctly', () => {
      const invalidData = {
        email: 'invalid',
        username: 'ab',
      };

      const result = validateProfileUpdate(invalidData);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toContain('email:');
        expect(formatted).toContain('username:');
      }
    });
  });
});
