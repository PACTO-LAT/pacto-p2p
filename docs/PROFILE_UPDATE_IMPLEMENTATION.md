# Profile Update Implementation

## Overview

This document describes the robust database integration implemented for the "Edit Profile" flow on the `/dashboard/profile` page.

## Implementation Summary

### 1. Validation Layer (`apps/web/lib/validations/profile.ts`)

Created a comprehensive Zod validation schema that validates:

- **Email**: Valid email format, max 255 characters
- **Username**: 3-30 alphanumeric characters with underscores/hyphens
- **Full Name**: Required, max 100 characters
- **Phone**: International format validation (e.g., +1234567890)
- **Country**: ISO 3166-1 alpha-2 codes (e.g., US, CR, MX)
- **Bio**: Max 500 characters
- **Stellar Address**: Valid Stellar address format (56 chars, starts with G)
- **Avatar URL**: Valid URL format
- **Notifications**: JSONB structure validation
- **Security**: JSONB structure validation
- **Payment Methods**: JSONB structure with bank account array validation

### 2. Enhanced Auth Service (`apps/web/lib/services/auth.ts`)

Updated `updateUserProfile()` method with:

- **Pre-validation**: Validates all fields using Zod schema before database call
- **Uniqueness Checks**: Prevents duplicate email, username, and stellar_address
- **Error Handling**: Specific error messages for:
  - Validation failures with detailed field-level errors
  - Unique constraint violations (23505)
  - Foreign key violations (23503)
  - User not found (PGRST116)
  - Generic database errors
- **Automatic Timestamp**: Updates `updated_at` on every save

### 3. Optimistic UI Updates (`apps/web/hooks/use-auth.ts`)

Enhanced `updateProfile()` function with:

- **Optimistic Updates**: Immediately updates UI before database call
- **Rollback on Error**: Reverts to original state if update fails
- **Refetch After Save**: Ensures UI consistency with database state
- **Error Propagation**: Throws errors for proper handling in components

### 4. Enhanced Profile Page (`apps/web/app/dashboard/profile/page.tsx`)

Improved `handleSave()` with:

- **Better Error Display**: Shows specific error messages from validation/database
- **Loading States**: Disables buttons and shows "Saving..." during update
- **State Management**: Resets local state after successful save
- **Edit Mode Control**: Keeps edit mode active on error, exits on success
- **Cancel Handler**: Discards unsaved changes and resets state

### 5. Client-Side Validation (`apps/web/components/profile/ProfileInfo.tsx`)

Added real-time field validation:

- **Inline Validation**: Validates fields as user types (when in edit mode)
- **Error Display**: Shows field-specific error messages below inputs
- **Visual Feedback**: Red border on invalid fields
- **Character Counter**: Shows bio character count (0/500)
- **Format Helpers**: Auto-uppercase country codes, placeholder text for formats

## Data Flow

```
User edits field
    ↓
Client-side validation (ProfileInfo)
    ↓
Local state update (page.tsx)
    ↓
User clicks "Save Changes"
    ↓
Optimistic UI update (use-auth.ts)
    ↓
Zod validation (profile.ts)
    ↓
Uniqueness checks (auth.ts)
    ↓
Database update (Supabase)
    ↓
Refetch user data (auth.ts)
    ↓
Update UI with fresh data (use-auth.ts)
    ↓
Show success toast & exit edit mode
```

## Error Handling

### Validation Errors
- Caught before database call
- Displayed as toast with specific field errors
- Edit mode remains active for corrections

### Database Errors
- **Email/Username Taken**: "This email/username is already in use"
- **Wallet Linked**: "This wallet address is already linked to another account"
- **User Not Found**: "User not found"
- **Network Errors**: "Failed to update profile: [error message]"

### Rollback Behavior
- On any error, optimistic UI update is rolled back
- User sees original data with error message
- Can retry or cancel edit mode

## Field Validation Rules

| Field | Rules | Example |
|-------|-------|---------|
| Email | Valid email, max 255 chars | user@example.com |
| Username | 3-30 chars, alphanumeric + _ - | john_doe123 |
| Full Name | Required, max 100 chars | John Doe |
| Phone | International format, max 20 chars | +15551234567 |
| Country | ISO alpha-2 code, exactly 2 chars | US, CR, MX |
| Bio | Max 500 chars | Trading since 2020... |
| Stellar Address | 56 chars, starts with G | GABC...XYZ |

## JSONB Field Structures

### Notifications
```typescript
{
  email_trades: boolean,
  email_escrows: boolean,
  push_notifications: boolean,
  sms_notifications: boolean
}
```

### Security
```typescript
{
  two_factor_enabled: boolean,
  login_notifications: boolean
}
```

### Payment Methods
```typescript
{
  sinpe_number?: string,
  preferred_method: 'sinpe' | 'bank_transfer',
  bank_accounts?: Array<{
    bank_iban: string,
    bank_name: string,
    bank_account_holder: string
  }>
}
```

## Testing Checklist

- [x] Valid data saves successfully
- [x] Invalid email format shows error
- [x] Invalid username format shows error
- [x] Invalid phone format shows error
- [x] Invalid country code shows error
- [x] Duplicate email prevented
- [x] Duplicate username prevented
- [x] Duplicate wallet address prevented
- [x] Bio character limit enforced
- [x] Optimistic update shows immediately
- [x] Error rolls back optimistic update
- [x] Success toast displayed
- [x] Error toast with specific message
- [x] Edit mode exits on success
- [x] Edit mode stays active on error
- [x] Cancel discards changes
- [x] Loading state during save
- [x] Data persists across page refresh
- [x] JSONB fields update correctly

## Future Enhancements

1. **Avatar Upload**: Integrate with Supabase Storage for image uploads
2. **Country Dropdown**: Replace text input with searchable country selector
3. **Phone Validation**: Add country-specific phone format validation
4. **Username Availability**: Real-time check as user types
5. **Email Verification**: Send verification email on email change
6. **Audit Log**: Track profile changes for security
7. **Rate Limiting**: Prevent excessive update requests
8. **Undo Feature**: Allow reverting recent changes

## Related Files

- `apps/web/lib/validations/profile.ts` - Validation schemas
- `apps/web/lib/services/auth.ts` - Database operations
- `apps/web/hooks/use-auth.ts` - Auth state management
- `apps/web/app/dashboard/profile/page.tsx` - Profile page
- `apps/web/components/profile/ProfileInfo.tsx` - Form component
- `apps/web/lib/types.ts` - TypeScript types
- `docs/DATABASE_SCHEMA.md` - Database schema reference
