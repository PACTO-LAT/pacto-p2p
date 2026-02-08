'use client';

import {
  MerchantSection,
  NotificationSettings,
  PaymentMethods,
  ProfileInfo,
  ProfileStats,
  SecuritySettings,
} from '@/components/profile';
import type { UserData } from '@/components/profile/types';
import { WalletInfo } from '@/components/shared/WalletInfo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { validateProfileUpdate } from '@/lib/schemas/profile-validation.schema';
import { EnhancedAuthService } from '@/lib/services/enhanced-auth.service';
import type { User } from '@/lib/types';
import { Settings } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function EnhancedProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
        full_name: localOverrides?.full_name ?? baseUser?.full_name ?? '',
        username: localOverrides?.username ?? baseUser?.username ?? '',
        bio: localOverrides?.bio ?? baseUser?.bio ?? '',
        phone: localOverrides?.phone ?? baseUser?.phone ?? '',
        country: localOverrides?.country ?? baseUser?.country ?? '',
        stellar_address:
          localOverrides?.stellar_address ?? baseUser?.stellar_address ?? '',
        avatar_url:
          localOverrides?.avatar_url ?? baseUser?.avatar_url ?? '',
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

  /**
   * Enhanced save handler with validation and error handling
   */
  const handleSave = async () => {
    if (!hydratedUserData) {
      toast.error('No user data to save');
      return;
    }

    // Clear previous validation errors
    setValidationErrors([]);
    setIsLoading(true);

    try {
      // Step 1: Prepare the payload
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

      // Step 2: Validate the payload
      const validation = validateProfileUpdate(payload);

      if (!validation.success) {
        const errors = validation.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        setValidationErrors(errors);

        toast.error('Validation failed', {
          description: errors[0], // Show first error in toast
        });

        setIsLoading(false);
        return;
      }

      // Step 3: Optimistic update (update UI immediately)
      const previousUserData = structuredClone(userData);

      // Step 4: Perform the actual update
      try {
        await updateProfile(validation.data);

        // Step 5: Success handling
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved.',
        });

        setIsEditing(false);
        setValidationErrors([]);

      } catch (updateError) {
        // Step 6: Revert optimistic update on error
        setUserData(previousUserData);

        // Get user-friendly error message
        const errorMessage = EnhancedAuthService.getErrorMessage(updateError);

        toast.error('Failed to update profile', {
          description: errorMessage,
        });

        // Keep edit mode open so user can fix the issue
        console.error('Profile update error:', updateError);
      }

    } catch (error) {
      // Handle unexpected errors
      const errorMessage = EnhancedAuthService.getErrorMessage(error);

      toast.error('An unexpected error occurred', {
        description: errorMessage,
      });

      console.error('Unexpected error during profile update:', error);

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel - revert to original user data
   */
  const handleCancel = useCallback(() => {
    setUserData(null); // Reset local overrides
    setValidationErrors([]);
    setIsEditing(false);
  }, []);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your personal information and settings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error) => (
              <li
                key={error}
                className="text-sm text-red-700 dark:text-red-300"
              >
                {error}
              </li>
            ))}

          </ul>
        </div>
      )}

      {!hydratedUserData ? (
        <div className="text-sm sm:text-base text-muted-foreground p-4 sm:p-6 text-center">
          Connect your wallet or sign in to manage your profile.
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="flex flex-col sm:flex-row h-auto p-1.5 sm:p-1.5 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-2 w-full sm:w-auto">
            <TabsTrigger
              value="profile"
              className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
            >
              Wallet
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="merchant"
              className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
            >
              Merchant
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <TabsContent value="wallet" className="space-y-4 sm:space-y-6">
            <WalletInfo showDetails={true} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 sm:space-y-6">
            <PaymentMethods
              paymentMethods={hydratedUserData.payment_methods}
              isEditing={isEditing}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <NotificationSettings
              notifications={hydratedUserData.notifications}
              onNotificationsChange={handleNotificationsChange}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 sm:space-y-6">
            <SecuritySettings
              security={hydratedUserData.security}
              onSecurityChange={handleSecurityChange}
            />
          </TabsContent>

          {/* Merchant Tab */}
          <TabsContent value="merchant" className="space-y-4 sm:space-y-6">
            <MerchantSection />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}