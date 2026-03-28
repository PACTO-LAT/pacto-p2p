'use client';

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
import { TRUSTLINES } from '@/utils/constants/trustlines';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

export function TradeTypeStep() {
  const form = useFormContext<ListingFormValues>();

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="" disabled>Select token</option>
                  {TRUSTLINES.filter((t) => !!t.address).map((t) => (
                    <option key={t.symbol} value={t.name}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
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
