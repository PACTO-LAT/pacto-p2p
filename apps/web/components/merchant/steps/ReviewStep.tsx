'use client';

import { Info } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { ListingFormValues } from '@/lib/listing-form-schema';

export function ReviewStep() {
  const form = useFormContext<ListingFormValues>();
  const values = useWatch({ control: form.control });

  const amount = values.amount ? Number(values.amount) : 0;
  const rate = values.rate ? Number(values.rate) : 0;
  const total =
    !Number.isNaN(amount) && !Number.isNaN(rate) ? (amount * rate).toFixed(2) : '—';
  const fiatCurrency = values.fiatCurrency || '';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trade Type</span>
          <span className="font-medium capitalize">{values.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stablecoin</span>
          <span className="font-medium">{values.token}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{values.amount || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate</span>
          <span className="font-medium">
            {values.rate || '—'} {fiatCurrency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">
            {total} {fiatCurrency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-medium">{values.paymentMethod || '—'}</span>
        </div>
        {(values.minAmount || values.maxAmount) && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min / Max</span>
            <span className="font-medium">
              {values.minAmount || '—'} / {values.maxAmount || '—'}
            </span>
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Add any special instructions or requirements..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Trustless Work Escrow
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Once your listing is accepted by the trader, a Trustless Work
              escrow contract will be created. This ensures secure,
              milestone-based trading with dispute resolution capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
