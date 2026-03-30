'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MerchantApplicationModal } from './MerchantApplicationModal';
import { MerchantApplicationFilters } from './MerchantApplicationFilters';
import {
  useMerchantApplications,
  useApproveMerchant,
  useRejectMerchant,
} from '@/hooks/use-admin';
import { toast } from 'sonner';
import type { MerchantApplication } from '@/lib/types/admin';

const statusVariants: Record<
  MerchantApplication['verification_status'],
  string
> = {
  pending:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  verified:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/30',
  rejected:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  revoked:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
};

export function MerchantApplications() {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedApplication, setSelectedApplication] =
    useState<MerchantApplication | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MerchantApplication | null>(null);
  const [rejectMessage, setRejectMessage] = useState('');

  const {
    data: applications,
    isLoading,
    error,
  } = useMerchantApplications(
    activeFilter === 'all' ? undefined : activeFilter
  );
  const approveMutation = useApproveMerchant();
  const rejectMutation = useRejectMerchant();

  const handleApprove = async (application: MerchantApplication) => {
    try {
      await approveMutation.mutateAsync({ id: application.id });
      toast.success('Merchant application approved successfully');
    } catch {
      toast.error('Failed to approve merchant application');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectMessage.trim()) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectTarget.id, reason: rejectMessage.trim() });
      toast.success('Merchant application rejected');
      setRejectTarget(null);
      setRejectMessage('');
    } catch {
      toast.error('Failed to reject merchant application');
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
        <p className="text-red-600">
          Failed to load merchant applications. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Merchant Applications</h2>
        <MerchantApplicationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-muted-foreground">
            No merchant applications found
            {activeFilter !== 'all' && ` with status "${activeFilter}"`}.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Applicant</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Applied</th>
                <th className="text-left py-3 px-4 font-medium">Bio</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application: MerchantApplication) => (
                <tr
                  key={application.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-muted/30"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium">
                      {application.display_name}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      @{application.slug}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {application.user?.email || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={
                        statusVariants[application.verification_status]
                      }
                    >
                      {application.verification_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">
                    {application.bio || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {application.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="btn-emerald"
                            onClick={() => handleApprove(application)}
                            disabled={
                              approveMutation.isPending ||
                              rejectMutation.isPending
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectTarget(application)}
                            disabled={
                              approveMutation.isPending ||
                              rejectMutation.isPending
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApplication && (
        <MerchantApplicationModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectMessage(''); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason so the merchant knows what to improve.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-message">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-message"
              placeholder="e.g. Your profile bio is incomplete. Please add more details about your trading experience."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => { setRejectTarget(null); setRejectMessage(''); }}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectMessage.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
