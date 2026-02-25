'use client';

import { AlertCircle, Camera, CheckCircle, User } from 'lucide-react';
import { useState } from 'react';
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

interface ProfileInfoProps {
  userData: ProfileData;
  isEditing: boolean;
  onUserDataChange: (data: ProfileData) => void;
}

export function ProfileInfo({
  userData,
  isEditing,
  onUserDataChange,
}: ProfileInfoProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
      case 'username':
        if (value && !/^[a-zA-Z0-9_-]{3,30}$/.test(value)) {
          errors.username = 'Username must be 3-30 characters (letters, numbers, _, -)';
        } else {
          delete errors.username;
        }
        break;
      case 'phone':
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
          errors.phone = 'Use international format (e.g., +1234567890)';
        } else {
          delete errors.phone;
        }
        break;
      case 'country':
        if (value && !/^[A-Z]{2}$/.test(value)) {
          errors.country = 'Use 2-letter country code (e.g., US, CR, MX)';
        } else {
          delete errors.country;
        }
        break;
      case 'full_name':
        if (!value || value.trim().length === 0) {
          errors.full_name = 'Full name is required';
        } else if (value.length > 100) {
          errors.full_name = 'Full name must be less than 100 characters';
        } else {
          delete errors.full_name;
        }
        break;
      case 'bio':
        if (value && value.length > 500) {
          errors.bio = 'Bio must be less than 500 characters';
        } else {
          delete errors.bio;
        }
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    onUserDataChange({
      ...userData,
      [field]: value,
    });
    
    if (isEditing) {
      validateField(field, value);
    }
  };

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
          <div className="space-y-2">
            <Label
              htmlFor="full_name"
              className="text-sm font-medium text-muted-foreground"
            >
              Full Name
            </Label>
            <Input
              id="full_name"
              value={userData.full_name}
              onChange={(e) => handleFieldChange('full_name', e.target.value)}
              disabled={!isEditing}
              className={`glass-effect-light ${fieldErrors.full_name ? 'border-red-500' : ''}`}
            />
            {fieldErrors.full_name && (
              <p className="text-xs text-red-500">{fieldErrors.full_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-muted-foreground"
            >
              Username
            </Label>
            <Input
              id="username"
              value={userData.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              disabled={!isEditing}
              className={`glass-effect-light ${fieldErrors.username ? 'border-red-500' : ''}`}
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={!isEditing}
              className={`glass-effect-light ${fieldErrors.email ? 'border-red-500' : ''}`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-muted-foreground"
            >
              Phone
            </Label>
            <Input
              id="phone"
              value={userData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="+1234567890"
              className={`glass-effect-light ${fieldErrors.phone ? 'border-red-500' : ''}`}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-500">{fieldErrors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="text-sm font-medium text-muted-foreground"
            >
              Country
            </Label>
            <Input
              id="country"
              value={userData.country}
              onChange={(e) => handleFieldChange('country', e.target.value.toUpperCase())}
              disabled={!isEditing}
              placeholder="US"
              maxLength={2}
              className={`glass-effect-light ${fieldErrors.country ? 'border-red-500' : ''}`}
            />
            {fieldErrors.country && (
              <p className="text-xs text-red-500">{fieldErrors.country}</p>
            )}
          </div>
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
            className={`glass-effect-light ${fieldErrors.bio ? 'border-red-500' : ''}`}
          />
          {fieldErrors.bio && (
            <p className="text-xs text-red-500">{fieldErrors.bio}</p>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {userData.bio?.length || 0}/500 characters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
