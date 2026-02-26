'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useUpsertMerchantProfile } from '@/hooks/useMerchant';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const applicationSchema = z.object({
  bio: z
    .string()
    .min(50, 'Please provide at least 50 characters describing your experience')
    .max(1000, 'Biography must be less than 1000 characters'),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface MerchantApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MerchantApplicationModal({
  open,
  onOpenChange,
  onSuccess,
}: MerchantApplicationModalProps) {
  const { user } = useAuth();
  const upsertMerchant = useUpsertMerchantProfile();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bio: '',
    },
  });

  async function onSubmit(values: ApplicationFormValues) {
    if (!user) {
      toast.error('User information not available. Please try again.');
      return;
    }

    try {
      // Auto-populate fields from user profile
      const merchantData = {
        display_name: user.full_name || user.username || user.email,
        bio: values.bio.trim(),
        location: user.country || undefined,
        // Set verification status to pending (handled by backend)
        is_public: false, // Keep private until verified
      };

      await upsertMerchant.mutateAsync(merchantData);
      
      toast.success('Merchant application submitted successfully! We will review your application and notify you of the status.');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit merchant application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Become a Merchant</DialogTitle>
          <DialogDescription>
            Tell us about your trading experience and why you want to become a merchant on PACTO P2P.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Trading Experience & Background
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your trading experience, background in cryptocurrency, and why you want to become a merchant on PACTO P2P. Include any relevant experience with P2P trading, customer service, or financial services..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <FormMessage />
                    <span>{field.value.length}/1000</span>
                  </div>
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Application Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your application will be reviewed by our team</li>
                <li>• You'll be notified via email about the status</li>
                <li>• Approval typically takes 1-3 business days</li>
                <li>• You can check your status in the Merchant tab</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={upsertMerchant.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={upsertMerchant.isPending}
              >
                {upsertMerchant.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}