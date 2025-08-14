import { useCallback, useState } from 'react';
import { validateAmount, validateEmail, validateRequired } from '@/lib/utils';

interface FormState<T> {
  data: T;
  isLoading: boolean;
  errors: Partial<Record<keyof T, string>>;
}

interface UseFormStateReturn<T> {
  formState: FormState<T>;
  updateField: (field: keyof T, value: T[keyof T]) => void;
  updateForm: (updates: Partial<T>) => void;
  setLoading: (loading: boolean) => void;
  setError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  validateField: (field: keyof T, value: T[keyof T]) => boolean;
  resetForm: (newData?: T) => void;
}

export function useFormState<T extends Record<string, unknown>>(
  initialState: T
): UseFormStateReturn<T> {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialState,
    isLoading: false,
    errors: {},
  });

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: '', // Clear error when field is updated
      },
    }));
  }, []);

  const updateForm = useCallback((updates: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...updates,
      },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): boolean => {
      let error: string | null = null;

      // Apply validation based on field type
      if (typeof value === 'string') {
        if (field === 'email') {
          error = validateEmail(value);
        } else if (
          field === 'amount' ||
          field === 'rate' ||
          field === 'minAmount' ||
          field === 'maxAmount'
        ) {
          error = validateAmount(value);
        } else {
          error = validateRequired(value, String(field));
        }
      } else {
        error = validateRequired(value, String(field));
      }

      if (error) {
        setError(field, error);
        return false;
      }

      // Clear error if validation passes
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: '',
        },
      }));

      return true;
    },
    [setError]
  );

  const resetForm = useCallback(
    (newData?: T) => {
      setFormState({
        data: newData || initialState,
        isLoading: false,
        errors: {},
      });
    },
    [initialState]
  );

  return {
    formState,
    updateField,
    updateForm,
    setLoading,
    setError,
    clearErrors,
    validateField,
    resetForm,
  };
}
