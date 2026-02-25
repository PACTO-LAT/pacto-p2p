# User Profile Image Upload Implementation

## Overview

This document describes the implementation of user profile image upload functionality for the Pacto P2P platform.

## Implementation Summary

### ✅ What Was Implemented

1. **Image Upload Functionality** in `ProfileInfo` component
2. **File Validation** (type and size)
3. **Preview System** with real-time updates
4. **Remove/Replace** existing images
5. **Loading States** during upload
6. **Error Handling** with user-friendly messages
7. **Supabase Storage Integration**

## Supabase Storage Setup

### Required Bucket Configuration

You need to create a Supabase Storage bucket for user profile images:

#### 1. Create Bucket

Run this in Supabase SQL Editor or Dashboard:

```sql
-- Create the user-profiles bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-profiles', 'user-profiles', true);
```

Or use the Supabase Dashboard:
1. Go to Storage section
2. Click "New bucket"
3. Name: `user-profiles`
4. Public bucket: ✅ Enabled
5. Click "Create bucket"

#### 2. Set Storage Policies

Run these policies in Supabase SQL Editor:

```sql
-- Policy: Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow public read access to all avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-profiles');

-- Policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);
```

#### 3. Bucket Structure

```
user-profiles/
└── avatars/
    ├── {user-id}-{uuid}.jpg
    ├── {user-id}-{uuid}.png
    └── {user-id}-{uuid}.webp
```

**File Naming Convention:**
- Format: `{user-id}-{uuid}.{extension}`
- Example: `550e8400-e29b-41d4-a716-446655440000-a1b2c3d4.jpg`
- User ID prefix allows for easy policy enforcement
- UUID ensures uniqueness

## Component Implementation

### ProfileInfo Component

**Location:** `apps/web/components/profile/ProfileInfo.tsx`

**Key Features:**

1. **File Input with Hidden Input Pattern**
   ```tsx
   <input
     ref={fileInputRef}
     type="file"
     accept="image/jpeg,image/png,image/webp"
     onChange={handleAvatarUpload}
     className="hidden"
   />
   ```

2. **Upload Handler**
   - Validates file type (JPEG, PNG, WebP)
   - Validates file size (max 5MB)
   - Generates unique filename
   - Uploads to Supabase Storage
   - Updates local state with public URL

3. **Remove Handler**
   - Extracts file path from URL
   - Deletes from Supabase Storage
   - Updates local state

4. **Preview System**
   - Shows uploaded image immediately
   - Falls back to existing avatar_url
   - Shows placeholder if no image

5. **Loading States**
   - Disables buttons during upload
   - Shows spinner icon
   - Prevents multiple uploads

## File Validation

### Accepted Formats
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/webp` (.webp)

### Size Limit
- Maximum: 5MB (5,242,880 bytes)

### Validation Logic
```typescript
// Type validation
const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
  toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
  return;
}

// Size validation
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  toast.error('Image size must be less than 5MB');
  return;
}
```

## User Flow

### Upload Flow

```
1. User clicks "Edit Profile"
   ↓
2. User clicks "Change Photo" button
   ↓
3. File picker opens
   ↓
4. User selects image file
   ↓
5. Validation runs (type + size)
   ↓
6. If valid:
   - Show loading state
   - Upload to Supabase Storage
   - Get public URL
   - Update preview
   - Update userData state
   - Show success toast
   ↓
7. If invalid:
   - Show error toast
   - Reset file input
```

### Remove Flow

```
1. User clicks "Remove" button
   ↓
2. Extract file path from URL
   ↓
3. Delete from Supabase Storage
   ↓
4. Clear preview
   ↓
5. Update userData state
   ↓
6. Show success toast
```

## Error Handling

### Upload Errors

| Error | Message | Cause |
|-------|---------|-------|
| Invalid file type | "Please upload a valid image file (JPEG, PNG, or WebP)" | File type not in accepted list |
| File too large | "Image size must be less than 5MB" | File size > 5MB |
| Upload failed | "Failed to upload profile picture. Please try again." | Supabase upload error |
| Storage policy | "Failed to upload profile picture. Please try again." | User not authenticated or policy violation |

### Remove Errors

| Error | Message | Cause |
|-------|---------|-------|
| Delete failed | "Failed to remove profile picture" | Supabase delete error |

## Integration with Profile Page

The ProfileInfo component is used in the profile page:

**Location:** `apps/web/app/dashboard/profile/page.tsx`

**Integration:**
```tsx
<ProfileInfo
  userData={hydratedUserData}
  isEditing={isEditing}
  onUserDataChange={handleUserDataChange}
/>
```

When the user saves the profile, the `avatar_url` is included in the update payload and persisted to the database.

## Database Schema

Ensure the `users` table has the `avatar_url` column:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_url';

-- Add column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Testing Checklist

- [ ] Supabase bucket `user-profiles` created
- [ ] Storage policies configured
- [ ] Upload JPEG image works
- [ ] Upload PNG image works
- [ ] Upload WebP image works
- [ ] File type validation works (try uploading .pdf)
- [ ] File size validation works (try uploading >5MB image)
- [ ] Preview shows immediately after upload
- [ ] Remove button appears after upload
- [ ] Remove button deletes image
- [ ] Loading state shows during upload
- [ ] Success toast appears on upload
- [ ] Error toast appears on validation failure
- [ ] Avatar persists after page refresh
- [ ] Multiple uploads replace previous image
- [ ] Old images are cleaned up (check storage)

## Security Considerations

### Storage Policies
- Users can only upload files with their user ID in the filename
- Users can only delete their own files
- Public read access for all avatars (needed for display)
- Authenticated users only for write operations

### File Validation
- Client-side validation for UX
- Server-side validation via Supabase policies
- File type restrictions prevent malicious uploads
- File size limits prevent storage abuse

### URL Security
- Public URLs are safe to store in database
- URLs contain bucket name and file path
- No sensitive information in URLs
- Files are served via Supabase CDN

## Performance Considerations

### Image Optimization
- Consider adding image resizing/compression
- Use WebP format for better compression
- Implement lazy loading for avatars
- Cache avatar URLs in browser

### Storage Management
- Old avatars are not automatically deleted
- Consider implementing cleanup job
- Monitor storage usage in Supabase dashboard
- Set up storage alerts for quota limits

## Future Enhancements

1. **Image Cropping**
   - Add image cropper before upload
   - Allow users to adjust crop area
   - Ensure consistent aspect ratio

2. **Image Compression**
   - Compress images before upload
   - Reduce file size automatically
   - Maintain acceptable quality

3. **Multiple Sizes**
   - Generate thumbnail versions
   - Store different sizes for different uses
   - Optimize loading performance

4. **Progress Indicator**
   - Show upload progress percentage
   - Better UX for large files
   - Cancel upload option

5. **Drag and Drop**
   - Allow drag and drop upload
   - More intuitive UX
   - Preview before upload

6. **Cleanup Job**
   - Automatically delete old avatars
   - Run on avatar update
   - Prevent storage bloat

## Troubleshooting

### Upload Fails with "Failed to upload"

**Possible causes:**
1. Bucket doesn't exist
2. Storage policies not configured
3. User not authenticated
4. Network error

**Solutions:**
1. Verify bucket exists in Supabase Dashboard
2. Check storage policies in SQL Editor
3. Ensure user is logged in
4. Check browser console for errors

### Images Don't Display

**Possible causes:**
1. Bucket not public
2. URL incorrect
3. File deleted from storage
4. CORS issues

**Solutions:**
1. Ensure bucket is public
2. Verify URL format in database
3. Check file exists in storage
4. Check Supabase CORS settings

### Policy Violations

**Possible causes:**
1. Filename doesn't match user ID
2. User not authenticated
3. Policy syntax error

**Solutions:**
1. Check filename generation logic
2. Verify auth.uid() is available
3. Review policy SQL syntax

## Related Files

- `apps/web/components/profile/ProfileInfo.tsx` - Main component
- `apps/web/app/dashboard/profile/page.tsx` - Profile page
- `apps/web/lib/supabase.ts` - Supabase client
- `apps/web/components/merchant/MerchantProfileForm.tsx` - Reference implementation
- `docs/DATABASE_SCHEMA.md` - Database schema reference

## Support

For issues or questions:
1. Check Supabase Storage logs
2. Review browser console errors
3. Verify storage policies
4. Check authentication status
5. Review this documentation
