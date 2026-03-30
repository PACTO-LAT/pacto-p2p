'use client';

import { useState } from 'react';
import {
  Calendar,
  Mail,
  User,
  MapPin,
  Globe,
  Star,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';
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
import {
  useApproveMerchant,
  useRejectMerchant,
  useRevokeMerchant,
} from '@/hooks/use-admin';
import { toast } from 'sonner';
import type { MerchantApplication } from '@/lib/types/admin';

type PendingAction = 'reject' | 'revoke' | null;

interface MerchantApplicationModalProps {
  application: MerchantApplication;
  onClose: () => void;
}

const statusVariants = {
  pending:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  verified:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/30',
  rejected:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  revoked:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
};

export function MerchantApplicationModal({
  application,
  onClose,
}: MerchantApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const approveMutation = useApproveMerchant();
  const rejectMutation = useRejectMerchant();
  const revokeMutation = useRevokeMerchant();

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: application.id });
      toast.success('Merchant application approved successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to approve merchant application');
      console.error(error);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !statusMessage.trim()) return;
    try {
      if (pendingAction === 'reject') {
        await rejectMutation.mutateAsync({ id: application.id, reason: statusMessage.trim() });
        toast.success('Merchant application rejected');
      } else {
        await revokeMutation.mutateAsync({ id: application.id, reason: statusMessage.trim() });
        toast.success('Merchant verification revoked');
      }
      setPendingAction(null);
      setStatusMessage('');
      handleClose();
    } catch (error) {
      toast.error(pendingAction === 'reject' ? 'Failed to reject merchant application' : 'Failed to revoke merchant verification');
      console.error(error);
    }
  };

  const isLoading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    revokeMutation.isPending;

  const isConfirming = rejectMutation.isPending || revokeMutation.isPending;

  return (
    <>
    <Dialog
      open={pendingAction !== null}
      onOpenChange={(open) => { if (!open) { setPendingAction(null); setStatusMessage(''); } }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {pendingAction === 'reject' ? 'Reject Application' : 'Revoke Verification'}
          </DialogTitle>
          <DialogDescription>
            {pendingAction === 'reject'
              ? 'Provide a reason so the merchant knows what to improve.'
              : 'Provide a reason for revoking this merchant\'s verification.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="status-message">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="status-message"
            placeholder="e.g. Your profile bio is incomplete. Please add more details about your trading experience."
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => { setPendingAction(null); setStatusMessage(''); }}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmAction}
            disabled={!statusMessage.trim() || isConfirming}
          >
            {isConfirming ? 'Processing...' : pendingAction === 'reject' ? 'Reject' : 'Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {application.display_name}
              </DialogTitle>
              <DialogDescription>@{application.slug}</DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={statusVariants[application.verification_status]}
            >
              {application.verification_status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {application.user?.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {application.user?.full_name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">User Since:</span>
                <span className="font-medium">
                  {application.user?.created_at
                    ? new Date(application.user.created_at).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Applied:</span>
                <span className="font-medium">
                  {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Merchant Profile */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Merchant Profile</h3>
            {application.bio && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Bio:</p>
                <p className="text-sm">{application.bio}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {application.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{application.location}</span>
                </div>
              )}
              {application.languages && application.languages.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Languages:</span>
                  <span className="font-medium">
                    {application.languages.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {application.socials &&
            Object.keys(application.socials).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Social Links</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(application.socials).map(
                    ([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 capitalize">
                          {platform}:
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {url}
                        </a>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Trading Stats */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Trading Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black border border-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {application.rating.toFixed(1)}
                </p>
              </div>
              <div className="bg-black border border-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Total Trades</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {application.total_trades}
                </p>
              </div>
              <div className="bg-black border border-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Volume Traded</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${application.volume_traded.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {application.verification_status === 'pending' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="btn-emerald flex-1"
                >
                  {approveMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setPendingAction('reject')}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {application.verification_status === 'verified' && (
              <Button
                onClick={() => setPendingAction('revoke')}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                <Ban className="w-4 h-4 mr-2" />
                Revoke Verification
              </Button>
            )}
            {(application.verification_status === 'rejected' ||
              application.verification_status === 'revoked') && (
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="btn-emerald flex-1"
              >
                {approveMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
