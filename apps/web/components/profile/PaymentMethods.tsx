'use client';

import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
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

import { PaymentMethodsData } from './types';

interface PaymentMethodsProps {
  paymentMethods: PaymentMethodsData;
  isEditing: boolean;
  onPaymentMethodsChange: (data: PaymentMethodsData) => void;
}

export function PaymentMethods({ 
  paymentMethods, 
  isEditing, 
  onPaymentMethodsChange 
}: PaymentMethodsProps) {
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
      <CardContent className="space-y-6">
        {/* SINPE Mobile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">SINPE Mobile</h3>
            <Badge variant="secondary" className="glass-effect-light">Costa Rica</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sinpe_number" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
              <Input
                id="sinpe_number"
                type="tel"
                value={paymentMethods.sinpe_number}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    sinpe_number: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="+506 1234 5678"
                className="glass-effect-light"
              />
              <p className="text-xs text-muted-foreground">
                Number registered in SINPE Mobile to receive transfers
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bank Transfer */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Bank Transfer</h3>
            <Badge variant="secondary" className="glass-effect-light">International</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_iban" className="text-sm font-medium text-muted-foreground">IBAN Number</Label>
              <Input
                id="bank_iban"
                value={paymentMethods.bank_iban}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    bank_iban: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="CR05015202001026284066"
                className="font-mono glass-effect-light"
              />
              <p className="text-xs text-muted-foreground">
                International IBAN code of your bank account
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="text-sm font-medium text-muted-foreground">Bank Name</Label>
              <Input
                id="bank_name"
                value={paymentMethods.bank_name}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    bank_name: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="National Bank of Costa Rica"
                className="glass-effect-light"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_holder" className="text-sm font-medium text-muted-foreground">
                Account Holder
              </Label>
              <Input
                id="bank_account_holder"
                value={paymentMethods.bank_account_holder}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    bank_account_holder: e.target.value,
                  })
                }
                disabled={!isEditing}
                placeholder="John Doe"
                className="glass-effect-light"
              />
              <p className="text-xs text-muted-foreground">
                Must match exactly with the name on your bank account
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Verify
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Preferred Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Preferred Method</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="preferred_sinpe"
                name="preferred_method"
                value="sinpe"
                checked={paymentMethods.preferred_method === 'sinpe'}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    preferred_method: e.target.value as 'sinpe' | 'bank_transfer',
                  })
                }
                disabled={!isEditing}
                className="w-4 h-4"
              />
              <Label
                htmlFor="preferred_sinpe"
                className="flex items-center gap-2"
              >
                SINPE Mobile
                <Badge variant="outline" className="text-xs">
                  Instant
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="preferred_bank"
                name="preferred_method"
                value="bank_transfer"
                checked={paymentMethods.preferred_method === 'bank_transfer'}
                onChange={(e) =>
                  onPaymentMethodsChange({
                    ...paymentMethods,
                    preferred_method: e.target.value as 'sinpe' | 'bank_transfer',
                  })
                }
                disabled={!isEditing}
                className="w-4 h-4"
              />
              <Label
                htmlFor="preferred_bank"
                className="flex items-center gap-2"
              >
                Bank Transfer
                <Badge variant="outline" className="text-xs">
                  1-3 days
                </Badge>
              </Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This will be the payment method shown by default in your
            listings
          </p>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Important Information
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              • Verify that all information is correct before saving
            </li>
            <li>
              • Payment methods must be in your name for greater
              security
            </li>
            <li>• SINPE Mobile is only available in Costa Rica</li>
            <li>• Bank transfers may take 1-3 days business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
