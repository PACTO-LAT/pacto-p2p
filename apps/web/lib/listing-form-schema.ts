import { z } from 'zod';

export const listingFormSchema = z
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

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const STEP_1_FIELDS = ['type', 'token', 'amount'] as const;
export const STEP_2_FIELDS = ['rate', 'fiatCurrency'] as const;
export const STEP_3_FIELDS = ['paymentMethod', 'minAmount', 'maxAmount'] as const;

export const LISTING_FORM_DEFAULT_VALUES: ListingFormValues = {
  type: 'sell',
  token: '',
  amount: '',
  rate: '',
  fiatCurrency: '',
  paymentMethod: '',
  minAmount: '',
  maxAmount: '',
  description: '',
};
