'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { TokenPickerModal } from '@/components/merchant/TokenPickerModal';
import { TokenIcon } from '@/components/shared/TokenIcon';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

export function TradeTypeStep() {
  const form = useFormContext<ListingFormValues>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const type = useWatch({ control: form.control, name: 'type' });
  const isSell = type === 'sell';

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trade Type</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex gap-3"
                value={field.value}
                onValueChange={field.onChange}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sell" id="modal-type-sell" />
                  <label htmlFor="modal-type-sell">Sell</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="buy" id="modal-type-buy" />
                  <label htmlFor="modal-type-buy">Buy</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Context banner */}
      <div
        className={`rounded-lg px-4 py-3 text-sm border ${
          isSell
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
        }`}
      >
        {isSell
          ? 'You are offering to sell your crypto — buyers will pay you in fiat.'
          : 'You are looking to buy crypto — you will pay sellers in fiat.'}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <FormControl>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none hover:border-ring transition-colors"
                >
                  {field.value ? (
                    <span className="flex items-center gap-2">
                      <TokenIcon token={field.value} size="sm" />
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select token</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </FormControl>
              <FormMessage />
              <TokenPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={field.onChange}
                selected={field.value}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isSell ? 'Amount to sell' : 'Amount to buy'}
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
