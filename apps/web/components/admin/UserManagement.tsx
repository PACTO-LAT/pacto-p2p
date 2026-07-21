'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { sileo } from 'sileo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type AdminUserRow,
  useAdminUsers,
  useUpdateUserKycStatus,
} from '@/hooks/use-admin';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const statusVariants: Record<
  NonNullable<AdminUserRow['kyc_status']>,
  string
> = {
  pending:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  verified:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/30',
  rejected:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

function getKycStatusLabel(
  status: AdminUserRow['kyc_status']
): 'verified' | 'pending' | 'rejected' {
  return status ?? 'pending';
}

export function UserManagement() {
  const [activeFilter, setActiveFilter] = useState('all');
  const {
    data: users,
    isLoading,
    error,
  } = useAdminUsers(activeFilter === 'all' ? undefined : activeFilter);
  const updateKycMutation = useUpdateUserKycStatus();

  const handleKycOverride = async (
    user: AdminUserRow,
    kycStatus: 'verified' | 'pending' | 'rejected'
  ) => {
    if (user.kyc_status === kycStatus) return;

    try {
      await updateKycMutation.mutateAsync({
        id: user.id,
        kyc_status: kycStatus,
      });
      sileo.success({ title: 'KYC status updated' });
    } catch {
      sileo.error({ title: 'Failed to update KYC status' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={activeFilter === filter.value}
              aria-label={`Filter by ${filter.label} KYC status`}
              className={
                activeFilter === filter.value
                  ? 'btn-emerald border-emerald-500'
                  : ''
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-muted-foreground">
            No users found
            {activeFilter !== 'all' && ` with KYC status "${activeFilter}"`}.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Country</th>
                <th className="text-left py-3 px-4 font-medium">KYC Status</th>
                <th className="text-left py-3 px-4 font-medium">Verified</th>
                <th className="text-left py-3 px-4 font-medium">Override</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const statusLabel = getKycStatusLabel(user.kyc_status);
                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-muted/30"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium">
                        {user.full_name || '—'}
                      </span>
                      {user.username && (
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.country || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={statusVariants[statusLabel]}
                      >
                        {statusLabel}
                      </Badge>
                      {user.kyc_provider && (
                        <p className="text-xs text-muted-foreground mt-1">
                          via {user.kyc_provider}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.kyc_verified_at
                        ? new Date(user.kyc_verified_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={statusLabel}
                        onValueChange={(value) =>
                          handleKycOverride(
                            user,
                            value as 'verified' | 'pending' | 'rejected'
                          )
                        }
                        disabled={updateKycMutation.isPending}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
