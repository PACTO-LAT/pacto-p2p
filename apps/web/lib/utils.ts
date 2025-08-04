import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common form utilities
export const createFormState = <T extends Record<string, unknown>>(
  initialState: T
) => {
  return {
    data: initialState,
    isLoading: false,
    errors: {} as Record<keyof T, string>,
  };
};

// Common dialog/modal utilities
export const createDialogState = <T = unknown>() => {
  return {
    isOpen: false,
    selectedItem: null as T | null,
  };
};

// Common validation utilities
export const validateRequired = (
  value: unknown,
  fieldName: string
): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validateAmount = (amount: string): string | null => {
  const num = parseFloat(amount);
  if (Number.isNaN(num) || num <= 0) {
    return 'Amount must be a positive number';
  }
  return null;
};

// Common data transformation utilities
export const transformListingsToDashboard = (
  listings: Record<string, unknown>[]
) => {
  return listings.map((listing) => ({
    id: listing.id,
    type: listing.type,
    token: listing.token,
    amount: listing.amount,
    rate: listing.rate,
    fiatCurrency: listing.fiatCurrency,
    status: listing.status,
    created: listing.created,
  }));
};

export const transformEscrowsToDashboard = (
  escrows: Record<string, unknown>[]
) => {
  return escrows.map((escrow) => ({
    id: escrow.id,
    type: escrow.type,
    token: escrow.token,
    amount: escrow.amount,
    buyer: escrow.buyer,
    seller: escrow.seller,
    status: escrow.status,
    progress: escrow.progress,
    created: escrow.created,
  }));
};

// Common async operation utilities
export const withLoading = async <T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T> => {
  setLoading(true);
  try {
    const result = await operation();
    return result;
  } finally {
    setLoading(false);
  }
};

// Common error handling utilities
export const handleAsyncError = (
  error: unknown,
  fallbackMessage = 'An error occurred'
) => {
  console.error('Async operation failed:', error);
  return error instanceof Error ? error.message : fallbackMessage;
};
