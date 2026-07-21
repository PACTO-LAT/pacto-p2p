'use client';

import { CreditCard, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  getCountryConfig,
  PAYMENT_METHODS,
  type PaymentMethodId,
} from '@/lib/payment-methods';
import type { PaymentMethodsData } from './types';

interface PaymentMethodsProps {
  country: string;
  paymentMethods: PaymentMethodsData;
  isEditing: boolean;
  onPaymentMethodsChange: (data: PaymentMethodsData) => void;
}

export function PaymentMethods({
  country,
  paymentMethods,
  isEditing,
  onPaymentMethodsChange,
}: PaymentMethodsProps) {
  const config = getCountryConfig(country);

  if (!config) {
    return (
      <Card className="feature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Configure your payment methods to receive money
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Set your country in the Profile tab first to configure payment
              methods for your region.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const instantMethods = config.methods
    .filter((methodId) => PAYMENT_METHODS[methodId].kind === 'instant')
    .map((methodId) => PAYMENT_METHODS[methodId]);

  const emptyBankAccount = {
    bank_identifier: '',
    bank_name: '',
    bank_account_holder: '',
  };

  const bankAccounts =
    paymentMethods.bank_accounts.length > 0
      ? paymentMethods.bank_accounts
      : [emptyBankAccount];

  const updateBankAccounts = (
    updater: (
      accounts: PaymentMethodsData['bank_accounts']
    ) => PaymentMethodsData['bank_accounts']
  ) => {
    onPaymentMethodsChange({
      ...paymentMethods,
      bank_accounts: updater(bankAccounts),
    });
  };

  const updateMethodDetail = (methodId: PaymentMethodId, value: string) => {
    onPaymentMethodsChange({
      ...paymentMethods,
      method_details: {
        ...paymentMethods.method_details,
        [methodId]: value,
      },
    });
  };

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Configure your payment methods to receive money in{' '}
          {config.countryName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {instantMethods.map((method, index) => (
          <div key={method.id}>
            {index > 0 && <Separator className="mb-6" />}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {method.label}
                </h3>
                <Badge variant="secondary" className="glass-effect-light">
                  {config.countryName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Instant
                </Badge>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`method_detail_${method.id}`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {method.detailLabel}
                </Label>
                <Input
                  id={`method_detail_${method.id}`}
                  type={method.detailLabel === 'Phone Number' ? 'tel' : 'text'}
                  value={paymentMethods.method_details[method.id] ?? ''}
                  onChange={(e) =>
                    updateMethodDetail(method.id, e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder={method.detailPlaceholder}
                  className="glass-effect-light"
                />
              </div>
            </div>
          </div>
        ))}

        {instantMethods.length > 0 && <Separator />}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {PAYMENT_METHODS.bank_transfer.label}
              </h3>
              <Badge variant="secondary" className="glass-effect-light">
                {config.countryName}
              </Badge>
            </div>
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  updateBankAccounts((accounts) => [
                    ...accounts,
                    emptyBankAccount,
                  ])
                }
              >
                Add bank account
              </Button>
            )}
          </div>

          {bankAccounts.map((acct, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: bank account list has no stable id
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4"
            >
              <div className="space-y-2">
                <Label
                  htmlFor={`bank_identifier_${idx}`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {config.bankIdentifier.label}
                </Label>
                <Input
                  id={`bank_identifier_${idx}`}
                  value={acct.bank_identifier}
                  onChange={(e) =>
                    updateBankAccounts((accounts) =>
                      accounts.map((a, i) =>
                        i === idx
                          ? { ...a, bank_identifier: e.target.value }
                          : a
                      )
                    )
                  }
                  disabled={!isEditing}
                  placeholder={config.bankIdentifier.placeholder}
                  className="font-mono glass-effect-light"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`bank_name_${idx}`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Bank Name
                </Label>
                <Input
                  id={`bank_name_${idx}`}
                  value={acct.bank_name}
                  onChange={(e) =>
                    updateBankAccounts((accounts) =>
                      accounts.map((a, i) =>
                        i === idx ? { ...a, bank_name: e.target.value } : a
                      )
                    )
                  }
                  disabled={!isEditing}
                  placeholder="Your bank name"
                  className="glass-effect-light"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`bank_holder_${idx}`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Account Holder
                </Label>
                <Input
                  id={`bank_holder_${idx}`}
                  value={acct.bank_account_holder}
                  onChange={(e) =>
                    updateBankAccounts((accounts) =>
                      accounts.map((a, i) =>
                        i === idx
                          ? { ...a, bank_account_holder: e.target.value }
                          : a
                      )
                    )
                  }
                  disabled={!isEditing}
                  placeholder="John Doe"
                  className="glass-effect-light"
                />
                <p className="text-xs text-muted-foreground">
                  Must match exactly with the name on your bank account
                </p>
              </div>
              {isEditing && bankAccounts.length > 1 && (
                <div className="flex items-end justify-end md:col-span-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      updateBankAccounts((accounts) =>
                        accounts.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Preferred Method
          </h3>
          <div className="space-y-3">
            {config.methods.map((methodId) => {
              const method = PAYMENT_METHODS[methodId];
              return (
                <div key={methodId} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`preferred_${methodId}`}
                    name="preferred_method"
                    value={methodId}
                    checked={paymentMethods.preferred_method === methodId}
                    onChange={() =>
                      onPaymentMethodsChange({
                        ...paymentMethods,
                        preferred_method: methodId,
                      })
                    }
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor={`preferred_${methodId}`}
                    className="flex items-center gap-2"
                  >
                    {method.label}
                    <Badge variant="outline" className="text-xs">
                      {method.kind === 'instant' ? 'Instant' : '1-3 days'}
                    </Badge>
                  </Label>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            This will be the payment method shown by default in your listings
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Important Information
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Verify that all information is correct before saving</li>
            <li>• Payment methods must be in your name for greater security</li>
            <li>• Bank transfers may take 1-3 business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
