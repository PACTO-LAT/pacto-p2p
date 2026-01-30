'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

const schema = z.object({
  bio: z
    .string()
    .trim()
    .min(20, 'Please share at least 20 characters about your experience.'),
});

type FormValues = z.infer<typeof schema>;

type MerchantApplicationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MerchantApplicationModal({
  open,
  onOpenChange,
}: MerchantApplicationModalProps) {
  const { user } = useAuth();
  const upsert = useUpsertMerchantProfile();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bio: '' },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ bio: '' });
    }
  }, [open, form]);

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast.error('Please sign in to apply as a merchant.');
      return;
    }

    const displayName = user.full_name?.trim() || user.username?.trim();
    if (!displayName) {
      toast.error('Add a full name or username to your profile first.');
      return;
    }

    const slugBase = user.username?.trim() || displayName;
    const location = user.country?.trim() || undefined;

    try {
      await upsert.mutateAsync({
        display_name: displayName,
        bio: values.bio.trim(),
        location,
        slug: slugBase || undefined,
      });
      toast.success('Application submitted', {
        description: 'Your merchant application is pending review.',
      });
      onOpenChange(false);
      form.reset({ bio: '' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Failed to submit application', { description: message });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (upsert.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to become a merchant</DialogTitle>
          <DialogDescription>
            Share a short overview of your trading experience. We'll review
            your application shortly.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography / Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Tell us about your experience, volumes, and payment methods you can support."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={upsert.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
