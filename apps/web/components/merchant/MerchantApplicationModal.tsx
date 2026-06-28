'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sileo } from 'sileo';
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
import { useAuth } from '@/hooks/use-auth';
import { useMerchantApplication } from '@/hooks/useMerchant';

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
  const applyMerchant = useMerchantApplication();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bio: '',
    },
  });

  async function onSubmit(values: ApplicationFormValues) {
    if (!user) {
      sileo.error({
        title: 'User information not available. Please try again.',
      });
      return;
    }

    try {
      const merchantData = {
        display_name: user.full_name || user.username || user.email || '',
        bio: values.bio.trim(),
        location: user.country || undefined,
        is_public: false, // Keep private until verified
      };

      await applyMerchant.mutateAsync(merchantData);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Toast handled by useMerchantApplication onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Become a Merchant</DialogTitle>
          <DialogDescription>
            Tell us about your trading experience and why you want to become a
            merchant on PACTO P2P.
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
                disabled={applyMerchant.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applyMerchant.isPending}>
                {applyMerchant.isPending && (
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
