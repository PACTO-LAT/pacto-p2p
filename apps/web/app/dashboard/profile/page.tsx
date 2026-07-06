'use client';

import { Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { sileo } from 'sileo';
import {
  MerchantSection,
  PaymentMethods,
  ProfileInfo,
  ProfileStats,
} from '@/components/profile';
import type { UserData } from '@/components/profile/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { validateProfileUpdate } from '@/lib/schemas/profile-validation.schema';
import { EnhancedAuthService } from '@/lib/services/enhanced-auth.service';
import type { User } from '@/lib/types';

const TAB_TRIGGER_CLASS =
  'bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap';

const VALID_TABS = ['profile', 'payments', 'merchant'];

function EnhancedProfilePageInner() {
  const searchParams = useSearchParams();
  const initialTab = VALID_TABS.includes(searchParams.get('tab') ?? '')
    ? (searchParams.get('tab') as string)
    : 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const {
    user,
    updateProfile,
    updateAvatarUrl,
    loading: authLoading,
  } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);

  const mapUserToUserData = useCallback(
    (u: User | null, local: UserData | null): UserData | null => {
      if (!u && !local) return null;
      const baseUser = u ?? null;
      const localOverrides = local ?? null;
      const normalizedEmail = (() => {
        const e =
          (localOverrides?.email?.length
            ? localOverrides.email
            : baseUser?.email || '') || '';
        return e.endsWith('@wallet.local') ? '' : e;
      })();
      return {
        id: baseUser?.id || localOverrides?.id || '',
        email: normalizedEmail,
        full_name: baseUser?.full_name || localOverrides?.full_name || '',
        username: baseUser?.username || localOverrides?.username || '',
        bio: baseUser?.bio || localOverrides?.bio || '',
        avatar_url:
          local !== null
            ? (localOverrides?.avatar_url ?? baseUser?.avatar_url ?? '')
            : (baseUser?.avatar_url ?? ''),
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
        payment_methods: (() => {
          const pm =
            baseUser?.payment_methods ?? localOverrides?.payment_methods;
          const defaultPm = {
            preferred_method: 'bank_transfer' as const,
            method_details: {},
            bank_accounts: [
              {
                bank_identifier: '',
                bank_name: '',
                bank_account_holder: '',
              },
            ],
          };
          if (!pm) return defaultPm;
          return {
            preferred_method: pm.preferred_method ?? 'bank_transfer',
            method_details: pm.method_details ?? {},
            bank_accounts: Array.isArray(pm.bank_accounts)
              ? pm.bank_accounts.map((b) => ({
                  bank_identifier: b.bank_identifier ?? '',
                  bank_name: b.bank_name ?? '',
                  bank_account_holder: b.bank_account_holder ?? '',
                }))
              : defaultPm.bank_accounts,
          };
        })(),
      };
    },
    []
  );

  const hydratedUserData = useMemo<UserData | null>(
    () => mapUserToUserData(user, userData),
    [user, userData, mapUserToUserData]
  );

  const handleSave = async () => {
    if (!hydratedUserData) {
      sileo.error({ title: 'No user data to save' });
      return;
    }

    setValidationErrors([]);
    setIsLoading(true);

    try {
      const payload = {
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
        payment_methods: hydratedUserData.payment_methods,
        stellar_address: hydratedUserData.stellar_address,
      } as const;

      const validation = validateProfileUpdate(payload);

      if (!validation.success) {
        const errors = validation.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        setValidationErrors(errors);
        sileo.error({
          title: 'Validation failed',
          description: errors[0],
        });
        return;
      }

      const previousUserData = hydratedUserData;

      try {
        await updateProfile(validation.data);
        sileo.success({
          title: 'Profile updated successfully',
          description: 'Your changes have been saved.',
        });
        setIsEditing(false);
        setValidationErrors([]);
      } catch (updateError) {
        setUserData(previousUserData);
        const errorMessage = EnhancedAuthService.getErrorMessage(updateError);
        sileo.error({
          title: 'Failed to update profile',
          description: errorMessage,
        });
        console.error('Profile update error:', updateError);
      }
    } catch (error) {
      const errorMessage = EnhancedAuthService.getErrorMessage(error);
      sileo.error({
        title: 'An unexpected error occurred',
        description: errorMessage,
      });
      console.error('Unexpected error during profile update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    setUserData(null);
    setValidationErrors([]);
    setIsEditing(false);
  }, []);

  const handleUserDataChange = (newData: Partial<UserData>) => {
    setUserData({ ...(hydratedUserData as UserData), ...newData });
  };

  const handlePaymentMethodsChange = (
    payment_methods: UserData['payment_methods']
  ) => {
    setUserData({ ...(hydratedUserData as UserData), payment_methods });
  };

  const isReady = !authLoading && !!hydratedUserData;

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-3 sm:space-y-4"
    >
      {/* Header row: title left | tabs center | button right */}
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your personal information and settings
          </p>
        </div>

        <div className="flex justify-center">
          {isReady && (
            <TabsList className="flex flex-row h-auto p-1 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-1 w-full sm:w-auto">
              <TabsTrigger value="profile" className={TAB_TRIGGER_CLASS}>
                Profile
              </TabsTrigger>
              <TabsTrigger value="payments" className={TAB_TRIGGER_CLASS}>
                Payments
              </TabsTrigger>
              <TabsTrigger value="merchant" className={TAB_TRIGGER_CLASS}>
                Merchant
              </TabsTrigger>
            </TabsList>
          )}
        </div>

        <div className="h-9 flex items-center justify-end gap-2">
          {isReady &&
            activeTab === 'profile' &&
            (isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="text-sm"
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
                className="text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ))}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {[...new Set(validationErrors)].map((error) => (
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

      {/* Content */}
      {authLoading ? (
        <div className="flex items-center justify-center p-8">
          <Settings className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : !hydratedUserData ? (
        <div className="text-sm sm:text-base text-muted-foreground p-4 sm:p-6 text-center">
          Connect your wallet or sign in to manage your profile.
        </div>
      ) : (
        <>
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <ProfileInfo
                  userData={hydratedUserData}
                  isEditing={isEditing}
                  onUserDataChange={handleUserDataChange}
                  onAvatarUploaded={async (avatarUrl) => {
                    await updateAvatarUrl(avatarUrl);
                  }}
                  onAvatarRemoved={async () => {
                    await updateAvatarUrl('');
                  }}
                />
              </div>
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 sm:space-y-6">
            <PaymentMethods
              country={hydratedUserData.country}
              paymentMethods={hydratedUserData.payment_methods}
              isEditing={isEditing}
              onPaymentMethodsChange={handlePaymentMethodsChange}
            />
          </TabsContent>

          {/* Merchant Tab */}
          <TabsContent value="merchant" className="space-y-4 sm:space-y-6">
            <MerchantSection />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}

export default function EnhancedProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Settings className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EnhancedProfilePageInner />
    </Suspense>
  );
}
