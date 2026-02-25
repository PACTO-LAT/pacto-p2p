# Profile Components

## Overview

This directory contains components for the user profile management system with robust validation, error handling, and optimistic UI updates.

## Components

### ProfileInfo
Main form component for editing personal information.

**Props:**
- `userData: ProfileData` - Current user profile data
- `isEditing: boolean` - Whether form is in edit mode
- `onUserDataChange: (data: ProfileData) => void` - Callback for data changes

**Features:**
- Real-time field validation with error messages
- Visual feedback (red borders on invalid fields)
- Character counter for bio field
- Auto-formatting (e.g., uppercase country codes)
- Disabled state when not editing

**Usage:**
```tsx
<ProfileInfo
  userData={userData}
  isEditing={isEditing}
  onUserDataChange={handleUserDataChange}
/>
```

### ProfileStats
Displays user statistics (reputation, trades, volume, account age).

**Props:**
- `stats: ProfileStatsData` - User statistics

### PaymentMethods
Manages payment method configuration (SINPE, bank transfers).

**Props:**
- `paymentMethods: PaymentMethodsData` - Current payment methods
- `isEditing: boolean` - Whether form is in edit mode
- `onPaymentMethodsChange: (data: PaymentMethodsData) => void` - Callback

### NotificationSettings
Manages notification preferences (email, push, SMS).

**Props:**
- `notifications: NotificationSettingsData` - Current settings
- `onNotificationsChange: (data: NotificationSettingsData) => void` - Callback

### SecuritySettings
Manages security settings (2FA, login notifications).

**Props:**
- `security: SecuritySettingsData` - Current settings
- `onSecurityChange: (data: SecuritySettingsData) => void` - Callback

## Validation

All profile updates are validated using Zod schemas defined in `apps/web/lib/validations/profile.ts`.

### Client-Side Validation
- Runs as user types (in edit mode)
- Shows immediate feedback
- Prevents submission of invalid data

### Server-Side Validation
- Runs before database update
- Checks uniqueness constraints
- Validates JSONB structures

## Error Handling

### Field-Level Errors
Displayed inline below each field:
```tsx
{fieldErrors.email && (
  <p className="text-xs text-red-500">{fieldErrors.email}</p>
)}
```

### Form-Level Errors
Displayed as toast notifications:
- Success: "Profile updated successfully"
- Validation: "Validation failed: [field]: [message]"
- Uniqueness: "This email/username is already in use"
- Generic: "Failed to update profile: [error]"

## State Management

### Local State (Component)
- `userData` - Local edits before save
- `fieldErrors` - Validation errors per field
- `isEditing` - Edit mode toggle
- `isLoading` - Save operation in progress

### Global State (useAuth)
- `user` - Current authenticated user
- `updateProfile()` - Save changes to database

### Data Flow
1. User edits field → Local state updated
2. Validation runs → Errors shown inline
3. User clicks Save → Optimistic update
4. Database update → Success/error handling
5. Refetch data → UI synced with database

## Best Practices

### Adding New Fields

1. **Update Type Definition** (`types.ts`):
```typescript
export interface ProfileData {
  // ... existing fields
  new_field: string;
}
```

2. **Update Validation Schema** (`validations/profile.ts`):
```typescript
export const profileUpdateSchema = z.object({
  // ... existing fields
  new_field: z.string().min(1, 'Field is required'),
});
```

3. **Add to ProfileInfo Component**:
```tsx
<div className="space-y-2">
  <Label htmlFor="new_field">New Field</Label>
  <Input
    id="new_field"
    value={userData.new_field}
    onChange={(e) => handleFieldChange('new_field', e.target.value)}
    disabled={!isEditing}
    className={`glass-effect-light ${fieldErrors.new_field ? 'border-red-500' : ''}`}
  />
  {fieldErrors.new_field && (
    <p className="text-xs text-red-500">{fieldErrors.new_field}</p>
  )}
</div>
```

4. **Add Validation Logic**:
```typescript
case 'new_field':
  if (!value || value.length < 3) {
    errors.new_field = 'Must be at least 3 characters';
  } else {
    delete errors.new_field;
  }
  break;
```

### Testing Changes

1. **Valid Data**: Verify field accepts correct format
2. **Invalid Data**: Verify error message displays
3. **Edge Cases**: Empty strings, max length, special characters
4. **Database**: Verify data persists correctly
5. **Uniqueness**: Test duplicate prevention (if applicable)

## Common Issues

### Issue: Changes not persisting
**Solution**: Check browser console for validation errors. Ensure all required fields are valid.

### Issue: Optimistic update not reverting on error
**Solution**: Verify error is being thrown and caught in `updateProfile()` hook.

### Issue: Validation errors not showing
**Solution**: Ensure `isEditing` is true and `validateField()` is called in `handleFieldChange()`.

### Issue: JSONB fields not updating
**Solution**: Ensure entire JSONB object is passed in update payload, not just changed fields.

## Related Documentation

- [Profile Update Implementation](../../../docs/PROFILE_UPDATE_IMPLEMENTATION.md)
- [Database Schema](../../../docs/DATABASE_SCHEMA.md)
- [Validation Schemas](../../lib/validations/profile.ts)
- [Auth Service](../../lib/services/auth.ts)
