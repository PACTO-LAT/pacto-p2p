'use client';

import { AlertCircle, Camera, CheckCircle, Loader2, User } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

import { ProfileData } from './types';
import { fieldValidators } from '@/lib/schemas/profile-validation.schema';

interface ProfileInfoProps {
  userData: ProfileData;
  isEditing: boolean;
  onUserDataChange: (data: ProfileData) => void;
}

interface FieldError {
  [key: string]: string | undefined;
}

export function ProfileInfo({
  userData,
  isEditing,
  onUserDataChange,
}: ProfileInfoProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [validatingFields, setValidatingFields] = useState<Set<string>>(
    new Set()
  );

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
          <Avatar className="w-20 h-20">
            <AvatarImage src={userData.avatar_url || '/placeholder.svg'} />
            <AvatarFallback className="text-lg">
              {userData.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
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