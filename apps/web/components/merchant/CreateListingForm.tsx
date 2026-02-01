'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TRUSTLINES } from '@/utils/constants/trustlines';
import { useCreateListing } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import {
  toCreateListingData,
  type UIListingFormInput,
} from '@/lib/marketplace-utils';

const schema = z
  .object({
    type: z.enum(['buy', 'sell']),
    token: z.string().min(1, 'Select a token'),
    amount: z.string().min(1, 'Enter an amount'),
    rate: z.string().min(1, 'Enter a rate'),
    fiatCurrency: z.string().min(1, 'Select a currency'),
    paymentMethod: z.string().min(1, 'Select a payment method'),
    minAmount: z.string().optional(),
    maxAmount: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const min = data.minAmount
        ? Number.parseFloat(data.minAmount)
        : undefined;
      const max = data.maxAmount
        ? Number.parseFloat(data.maxAmount)
        : undefined;
      return min && max ? min <= max : true;
    },
    {
      message: 'Min amount must be less than or equal to max amount',
      path: ['minAmount'],
    }
  );

type FormValues = z.infer<typeof schema>;

export function CreateListingForm({ onCreated }: { onCreated?: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      type: 'sell',
      token: '',
      amount: '',
      rate: '',
      fiatCurrency: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: '',
      description: '',
    },
  });

  const createListing = useCreateListing();
  const { user } = useAuth();

  async function onSubmit(values: FormValues) {
    if (!user?.id) {
      toast.error('Connect your wallet first');
      return;
    }
    const listingData = toCreateListingData(values as UIListingFormInput);
    await createListing.mutateAsync({ userId: user.id, listingData });
    toast.success('Listing created');
    form.reset();
    onCreated?.();
  }

  return (
    <Card className="feature-card-dark rounded-2xl p-4 sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                      <RadioGroupItem value="sell" id="type-sell" />
                      <label htmlFor="type-sell">Sell</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="buy" id="type-buy" />
                      <label htmlFor="type-buy">Buy</label>
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
                  <FormLabel>Stablecoin</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRUSTLINES.map((t) => (
                          <SelectItem key={t.address} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate per Token</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiatCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiat Currency</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRC">
                          CRC - Costa Rican Colón
                        </SelectItem>
                        <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINPE">SINPE (Costa Rica)</SelectItem>
                      <SelectItem value="SPEI">SPEI (Mexico)</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

          <div className="flex justify-end">
            <Button type="submit" disabled={createListing.isPending}>
              {createListing.isPending ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
