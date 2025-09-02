'use client';

import { Settings } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletInfo } from '@/components/shared/WalletInfo';
import {
  MerchantSection,
  NotificationSettings,
  PaymentMethods,
  ProfileInfo,
  ProfileStats,
  SecuritySettings,
} from '@/components/profile';
import type { UserData } from '@/components/profile/types';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const mapUserToUserData = useCallback(
    (u: User | null, local: UserData | null): UserData | null => {
      if (!u && !local) return null;
      const baseUser = u ?? null;
      const localOverrides = local ?? null;
      const normalizedEmail = (() => {
        // Prefer local edits over base user email (to allow typing)
        const e =
          (localOverrides?.email?.length
            ? localOverrides.email
            : baseUser?.email || '') || '';
        // Hide synthetic wallet-local email in UI to allow user to set a real one
        return e.endsWith('@wallet.local') ? '' : e;
      })();
      return {
        id: baseUser?.id || localOverrides?.id || '',
        email: normalizedEmail,
        full_name: baseUser?.full_name || localOverrides?.full_name || '',
        username: baseUser?.username || localOverrides?.username || '',
        bio: baseUser?.bio || localOverrides?.bio || '',
        avatar_url: baseUser?.avatar_url || localOverrides?.avatar_url || '',
        stellar_address:
          baseUser?.stellar_address || localOverrides?.stellar_address || '',
        phone: baseUser?.phone || localOverrides?.phone || '',
        country: baseUser?.country || localOverrides?.country || '',
        kyc_status:
          baseUser?.kyc_status || localOverrides?.kyc_status || 'pending',
        reputation_score:
          baseUser?.reputation_score ?? localOverrides?.reputation_score ?? 0,
        total_trades:
          baseUser?.total_trades ?? localOverrides?.total_trades ?? 0,
        total_volume:
          baseUser?.total_volume ?? localOverrides?.total_volume ?? 0,
        created_at:
          baseUser?.created_at ||
          localOverrides?.created_at ||
          new Date().toISOString(),
        notifications: localOverrides?.notifications ?? {
          email_trades: true,
          email_escrows: true,
          push_notifications: true,
          sms_notifications: false,
        },
        security: localOverrides?.security ?? {
          two_factor_enabled: true,
          login_notifications: true,
        },
        payment_methods: localOverrides?.payment_methods ?? {
          sinpe_number: '',
          preferred_method: 'sinpe',
          bank_accounts: [
            {
              bank_iban: '',
              bank_name: '',
              bank_account_holder: '',
            },
          ],
        },
      };
    },
    []
  );

  const hydratedUserData = useMemo<UserData | null>(
    () => mapUserToUserData(user, userData),
    [user, userData, mapUserToUserData]
  );

  const handleSave = async () => {
    if (!hydratedUserData) return;
    setIsLoading(true);
    try {
      const payload = {
        // Only persist email if user provided a non-empty value
        ...(hydratedUserData.email &&
        !hydratedUserData.email.endsWith('@wallet.local')
          ? { email: hydratedUserData.email }
          : {}),
        full_name: hydratedUserData.full_name,
        username: hydratedUserData.username,
        bio: hydratedUserData.bio,
        avatar_url: hydratedUserData.avatar_url,
        phone: hydratedUserData.phone,
        country: hydratedUserData.country,
        kyc_status: hydratedUserData.kyc_status,
        notifications: hydratedUserData.notifications,
        security: hydratedUserData.security,
        payment_methods: hydratedUserData.payment_methods,
        stellar_address: hydratedUserData.stellar_address,
      } as const;
      await updateProfile(payload);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleUserDataChange = (newData: Partial<UserData>) => {
    setUserData({ ...(hydratedUserData as UserData), ...newData });
  };

  const handleNotificationsChange = (
    notifications: UserData['notifications']
  ) => {
    setUserData({ ...(hydratedUserData as UserData), notifications });
  };

  const handleSecurityChange = (security: UserData['security']) => {
    setUserData({ ...(hydratedUserData as UserData), security });
  };

  const handlePaymentMethodsChange = (
    payment_methods: UserData['payment_methods']
  ) => {
    setUserData({ ...(hydratedUserData as UserData), payment_methods });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and settings
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {!hydratedUserData ? (
        <div className="text-muted-foreground">
          Connect your wallet or sign in to manage your profile.
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="merchant">Merchant</TabsTrigger>
            <TabsTrigger value="settings">Notifications</TabsTrigger>
            {/* <TabsTrigger value="security">Security</TabsTrigger> */}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <ProfileInfo
                  userData={hydratedUserData}
                  isEditing={isEditing}
                  onUserDataChange={handleUserDataChange}
                />
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <ProfileStats
                  stats={{
                    reputation_score: hydratedUserData.reputation_score,
                    total_trades: hydratedUserData.total_trades,
                    total_volume: hydratedUserData.total_volume,
                    created_at: hydratedUserData.created_at,
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <WalletInfo showDetails={true} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentMethods
              paymentMethods={hydratedUserData.payment_methods}
              isEditing={isEditing}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <NotificationSettings
              notifications={hydratedUserData.notifications}
              onNotificationsChange={handleNotificationsChange}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettings
              security={hydratedUserData.security}
              onSecurityChange={handleSecurityChange}
            />
          </TabsContent>

          {/* Merchant Tab */}
          <TabsContent value="merchant" className="space-y-6">
            <MerchantSection />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
