'use client';

import { Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import { SecuritySettingsData } from './types';

interface SecuritySettingsProps {
  security: SecuritySettingsData;
  onSecurityChange: (data: SecuritySettingsData) => void;
}

export function SecuritySettings({
  security,
  onSecurityChange,
}: SecuritySettingsProps) {
  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-emerald-400" />
          Security
        </CardTitle>
        <CardDescription>
          Configure your account security options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Two-Factor Authentication
            </Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={security.two_factor_enabled}
              onCheckedChange={(checked) =>
                onSecurityChange({
                  ...security,
                  two_factor_enabled: checked,
                })
              }
            />
            {security.two_factor_enabled && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </Badge>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Login Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when someone accesses your account
            </p>
          </div>
          <Switch
            checked={security.login_notifications}
            onCheckedChange={(checked) =>
              onSecurityChange({
                ...security,
                login_notifications: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Change Password
          </Label>
          <Button variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
