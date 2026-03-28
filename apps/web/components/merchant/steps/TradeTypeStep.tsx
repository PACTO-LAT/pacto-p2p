'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TokenPickerModal } from '@/components/merchant/TokenPickerModal';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

export function TradeTypeStep() {
  const form = useFormContext<ListingFormValues>();
  const [pickerOpen, setPickerOpen] = useState(false);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
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
                  <span className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                    {field.value || 'Select token'}
                  </span>
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
              <FormLabel>Amount</FormLabel>
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
