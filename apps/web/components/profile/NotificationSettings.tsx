'use client';

import { Bell } from 'lucide-react';
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

import { NotificationSettingsData } from './types';

interface NotificationSettingsProps {
  notifications: NotificationSettingsData;
  onNotificationsChange: (data: NotificationSettingsData) => void;
}

export function NotificationSettings({ 
  notifications, 
  onNotificationsChange 
}: NotificationSettingsProps) {
  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="w-5 h-5 text-emerald-400" />
          Notifications
        </CardTitle>
        <CardDescription>
          Configure how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Trade Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails when you have new trades
            </p>
          </div>
          <Switch
            checked={notifications.email_trades}
            onCheckedChange={(checked) =>
              onNotificationsChange({
                ...notifications,
                email_trades: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Escrow Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about the status of your escrows
            </p>
          </div>
          <Switch
            checked={notifications.email_escrows}
            onCheckedChange={(checked) =>
              onNotificationsChange({
                ...notifications,
                email_escrows: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch
            checked={notifications.push_notifications}
            onCheckedChange={(checked) =>
              onNotificationsChange({
                ...notifications,
                push_notifications: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive SMS for important events
            </p>
          </div>
          <Switch
            checked={notifications.sms_notifications}
            onCheckedChange={(checked) =>
              onNotificationsChange({
                ...notifications,
                sms_notifications: checked,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
