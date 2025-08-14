'use client';

import { DollarSign, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { ReportPaymentData } from '@/lib/types/escrow';

interface ReportPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReportPaymentData) => Promise<void>;
  isLoading: boolean;
}

export function ReportPaymentModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ReportPaymentModalProps) {
  const form = useForm<ReportPaymentData>({
    defaultValues: {
      evidence: '',
    },
  });

  const handleSubmit = async (data: ReportPaymentData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error('Error reporting payment');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isLoading) {
          onOpenChange(open);
          if (!open) {
            form.reset();
          }
        }
      }}
    >
      <DialogContent className="glass-card !max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-gradient">
            Report Payment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Report a payment that has not been made or is not correct. Provide
            evidence for resolution.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Evidence (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Photos, videos, documents, etc. that support your claim."
                      disabled={isLoading}
                      className="input-glass"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full btn-emerald"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4 mr-2" />
              )}
              Report Payment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
