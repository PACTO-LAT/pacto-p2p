'use client';

import { Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletInfo } from '@/components/wallet-info';
import {
  MerchantSection,
  NotificationSettings,
  PaymentMethods,
  ProfileInfo,
  ProfileStats,
  SecuritySettings,
} from '@/components/profile';
import { UserData } from '@/components/profile/types';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in real app, this would come from useAuth hook
  const [userData, setUserData] = useState<UserData>({
    id: 'user_123',
    email: 'user@example.com',
    full_name: 'John Doe',
    username: 'johndoe',
    bio: 'Experienced trader in Stellar ecosystem. Focused on USDC and EURC trading.',
    avatar_url: '',
    stellar_address: 'GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    phone: '+1234567890',
    country: 'United States',
    kyc_status: 'verified',
    reputation_score: 4.8,
    total_trades: 127,
    total_volume: 45000,
    created_at: '2024-01-15',
    notifications: {
      email_trades: true,
      email_escrows: true,
      push_notifications: true,
      sms_notifications: false,
    },
    security: {
      two_factor_enabled: true,
      login_notifications: true,
    },
    payment_methods: {
      sinpe_number: '+50612345678',
      bank_iban: 'CR05015202001026284066',
      bank_name: 'National Bank of Costa Rica',
      bank_account_holder: 'John Doe',
      preferred_method: 'sinpe',
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleUserDataChange = (newData: Partial<UserData>) => {
    setUserData({ ...userData, ...newData });
  };

  const handleNotificationsChange = (notifications: UserData['notifications']) => {
    setUserData({ ...userData, notifications });
  };

  const handleSecurityChange = (security: UserData['security']) => {
    setUserData({ ...userData, security });
  };

  const handlePaymentMethodsChange = (payment_methods: UserData['payment_methods']) => {
    setUserData({ ...userData, payment_methods });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Profile
            </h1>
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
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="merchant">Merchant</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <ProfileInfo
                  userData={userData}
                  isEditing={isEditing}
                  onUserDataChange={handleUserDataChange}
                />
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <ProfileStats
                  stats={{
                    reputation_score: userData.reputation_score,
                    total_trades: userData.total_trades,
                    total_volume: userData.total_volume,
                    created_at: userData.created_at,
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
              paymentMethods={userData.payment_methods}
              isEditing={isEditing}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <NotificationSettings
              notifications={userData.notifications}
              onNotificationsChange={handleNotificationsChange}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettings
              security={userData.security}
              onSecurityChange={handleSecurityChange}
            />
          </TabsContent>

          {/* Merchant Tab */}
          <TabsContent value="merchant" className="space-y-6">
            <MerchantSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
