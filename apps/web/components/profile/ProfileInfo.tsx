'use client';

import { AlertCircle, Camera, CheckCircle, Loader2, User, X } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sileo } from 'sileo';
import { supabase } from '@/lib/supabase';

import type { ProfileData } from './types';
import { fieldValidators } from '@/lib/schemas/profile-validation.schema';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;
const AVATAR_MAX_DIMENSION = 512; // px — max width/height after resize
const AVATAR_JPEG_QUALITY = 0.85; // 0–1

/**
 * Resize and compress an image to a reasonable avatar size using the Canvas API.
 * Always outputs a JPEG blob, regardless of the input format.
 */
async function compressAvatarImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Compute target dimensions (maintain aspect ratio)
      let { width, height } = img;
      if (width > height) {
        if (width > AVATAR_MAX_DIMENSION) {
          height = Math.round((height * AVATAR_MAX_DIMENSION) / width);
          width = AVATAR_MAX_DIMENSION;
        }
      } else {
        if (height > AVATAR_MAX_DIMENSION) {
          width = Math.round((width * AVATAR_MAX_DIMENSION) / height);
          height = AVATAR_MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        },
        'image/jpeg',
        AVATAR_JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

interface ProfileInfoProps {
  userData: ProfileData;
  isEditing: boolean;
  onUserDataChange: (data: ProfileData) => void;
  /** Called after successful avatar upload - use to persist to DB */
  onAvatarUploaded?: (avatarUrl: string) => Promise<void>;
  /** Called when avatar is removed - use to persist to DB */
  onAvatarRemoved?: () => Promise<void>;
}

interface FieldError {
  [key: string]: string | undefined;
}

export function ProfileInfo({
  userData,
  isEditing,
  onUserDataChange,
  onAvatarUploaded,
  onAvatarRemoved,
}: ProfileInfoProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [validatingFields, setValidatingFields] = useState<Set<string>>(
    new Set()
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate a single field with real-time feedback
   */
  const validateField = useCallback(
    (fieldName: string, value: string) => {
      setValidatingFields((prev) => new Set(prev).add(fieldName));

      // Use the appropriate validator
      let result: { success: boolean; error?: string } = { success: true };

      switch (fieldName) {
        case 'email':
          result = fieldValidators.email(value);
          break;
        case 'username':
          result = fieldValidators.username(value);
          break;
        case 'phone':
          result = fieldValidators.phone(value);
          break;
        case 'country':
          result = fieldValidators.country(value);
          break;
        case 'stellar_address':
          result = fieldValidators.stellarAddress(value);
          break;
      }

      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: result.error,
      }));

      setValidatingFields((prev) => {
        const next = new Set(prev);
        next.delete(fieldName);
        return next;
      });

      return result.success;
    },
    []
  );

  /**
   * Handle field change with validation
   */
  const handleFieldChange = useCallback(
    (fieldName: keyof ProfileData, value: string) => {
      // Update the value immediately for responsive UX
      onUserDataChange({
        ...userData,
        [fieldName]: value,
      });

      // Validate if editing (debounced validation happens on blur)
      if (isEditing && value) {
        // Clear previous error while typing
        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: undefined,
        }));
      }
    },
    [userData, onUserDataChange, isEditing]
  );

  /**
   * Handle field blur for validation
   */
  const handleFieldBlur = useCallback(
    (fieldName: string, value: string) => {
      if (isEditing && value) {
        validateField(fieldName, value);
      }
    },
    [isEditing, validateField]
  );

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        sileo.error({
          title: 'Invalid file type',
          description: 'Please use JPEG, PNG, or WebP format.',
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        sileo.error({
          title: 'File too large',
          description: `Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }

      if (!userData.id) {
        sileo.error({ title: 'Please sign in to upload a profile picture' });
        return;
      }

      setIsUploadingAvatar(true);
      e.target.value = '';

      const UPLOAD_TIMEOUT_MS = 20000; // 20s is enough for a compressed avatar
      const timeoutId = setTimeout(() => {
        setIsUploadingAvatar(false);
        sileo.error({ title: 'Upload timed out', description: 'Please try again.' });
      }, UPLOAD_TIMEOUT_MS);

      try {
        // Compress and resize before upload — converts to JPEG regardless of input format
        const compressedBlob = await compressAvatarImage(file);
        const path = `avatars/${userData.id}-${crypto.randomUUID()}.jpg`;

        const { error } = await supabase.storage
          .from('user-profiles')
          .upload(path, compressedBlob, { upsert: true, contentType: 'image/jpeg' });

        if (error) {
          clearTimeout(timeoutId);
          throw error;
        }

        const { data: urlData } = supabase.storage.from('user-profiles').getPublicUrl(path);

        onUserDataChange({ ...userData, avatar_url: urlData.publicUrl });

        if (onAvatarUploaded) {
          try {
            await onAvatarUploaded(urlData.publicUrl);
          } catch (saveErr) {
            console.error('Failed to save avatar to profile:', saveErr);
            sileo.error({
              title: 'Upload OK, save failed',
              description: saveErr instanceof Error ? saveErr.message : 'Click Save Changes to retry.',
            });
          }
        }

        clearTimeout(timeoutId);
        sileo.success({ title: 'Profile picture updated' });
      } catch (err) {
        clearTimeout(timeoutId);
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Could not upload image. Please try again.';
        console.error('Avatar upload error:', err);
        sileo.error({
          title: 'Upload failed',
          description: message,
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [userData, onUserDataChange, onAvatarUploaded]
  );

  const handleAvatarRemove = useCallback(async () => {
    const previousAvatarUrl = userData.avatar_url;

    // Clear avatar in UI immediately (optimistic update)
    onUserDataChange({ ...userData, avatar_url: '' });

    try {
      // Update DB first — this is the critical operation
      if (onAvatarRemoved) {
        await onAvatarRemoved();
      }

      sileo.success({ title: 'Profile picture removed' });

      // Best-effort: delete the file from storage (non-blocking).
      // Don't await — a hanging storage call should never block the remove flow.
      if (previousAvatarUrl?.includes('/storage/v1/object/public/user-profiles/')) {
        const path = previousAvatarUrl.split('/storage/v1/object/public/user-profiles/')[1];
        if (path) {
          supabase.storage
            .from('user-profiles')
            .remove([path])
            .catch((err) => console.warn('Storage cleanup failed (non-blocking):', err));
        }
      }
    } catch (err) {
      // Revert optimistic update on DB failure
      onUserDataChange({ ...userData, avatar_url: previousAvatarUrl });
      console.error('Failed to remove avatar:', err);
      sileo.error({
        title: 'Remove failed',
        description: err instanceof Error ? err.message : 'Click Save Changes to retry.',
      });
    }
  }, [userData, onUserDataChange, onAvatarRemoved]);

  const getKycStatusBadge = () => {
    switch (userData.kyc_status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  /**
   * Render input field with validation
   */
  const renderInputField = (
    id: keyof ProfileData,
    label: string,
    type: string = 'text',
    placeholder?: string
  ) => {
    const hasError = !!fieldErrors[id];
    const isValidating = validatingFields.has(id);

    return (
      <div className="space-y-2">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </Label>
        <div className="relative">
          <Input
            id={id}
            type={type}
            value={userData[id] as string}
            onChange={(e) => handleFieldChange(id, e.target.value)}
            onBlur={(e) => handleFieldBlur(id, e.target.value)}
            disabled={!isEditing}
            placeholder={placeholder}
            className={`glass-effect-light ${hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
              }`}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {hasError && (
          <p
            id={`${id}-error`}
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {fieldErrors[id]}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <User className="w-5 h-5 text-emerald-400" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your basic information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-muted">
            {userData.avatar_url ? (
              <Image
                src={userData.avatar_url}
                alt="Profile"
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <Avatar className="w-full h-full rounded-none">
                <AvatarFallback className="text-lg bg-muted">
                  {(userData.full_name || userData.username || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            )}
          </div>
          {isEditing && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {userData.avatar_url ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {userData.avatar_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAvatarRemove}
                  disabled={isUploadingAvatar}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInputField('full_name', 'Full Name')}
          {renderInputField('username', 'Username', 'text', 'your-username')}
          {renderInputField('email', 'Email', 'email', 'you@example.com')}
          {renderInputField('phone', 'Phone', 'tel', '+1234567890')}
          {renderInputField('country', 'Country', 'text', 'US')}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              KYC Status
            </Label>
            <div className="flex items-center gap-2">
              {getKycStatusBadge()}
              {userData.kyc_status !== 'verified' && (
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Complete KYC
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="bio"
            className="text-sm font-medium text-muted-foreground"
          >
            Biography
          </Label>
          <Textarea
            id="bio"
            value={userData.bio}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            disabled={!isEditing}
            rows={3}
            placeholder="Tell us about yourself and your trading experience..."
            className={`glass-effect-light ${fieldErrors.bio
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
              }`}
            maxLength={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{userData.bio?.length || 0} / 1000 characters</span>
            {fieldErrors.bio && (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.bio}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}