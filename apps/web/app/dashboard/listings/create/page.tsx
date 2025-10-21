'use client';

import { ArrowLeft, Calculator, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
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

export default function CreateListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UIListingFormInput>({
    type: 'sell',
    token: '',
    amount: '',
    rate: '',
    fiatCurrency: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const createListing = useCreateListing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const listingData = toCreateListingData(formData);
      await createListing.mutateAsync({ userId: user.id, listingData });
      router.push('/dashboard/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const amount = Number.parseFloat(formData.amount) || 0;
    const rate = Number.parseFloat(formData.rate) || 0;
    return (amount * rate).toFixed(2);
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="glass-button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-emerald-gradient">Create Listing</h1>
          <p className="text-muted-foreground">Create a new OTC trade listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trade Type */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Trade Type</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose whether you want to buy or sell stablecoins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="sell"
                  id="sell"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="sell"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-glass-border bg-glass-card p-6 hover:bg-glass-hover hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-500/10 cursor-pointer transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2 text-foreground">Sell</div>
                    <div className="text-sm text-muted-foreground">
                      I want to sell my stablecoins for fiat
                    </div>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="buy" id="buy" className="peer sr-only" />
                <Label
                  htmlFor="buy"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-glass-border bg-glass-card p-6 hover:bg-glass-hover hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 [&:has([data-state=checked])]:border-emerald-500 [&:has([data-state=checked])]:bg-emerald-500/10 cursor-pointer transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2 text-foreground">Buy</div>
                    <div className="text-sm text-muted-foreground">
                      I want to buy stablecoins with fiat
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Token Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Stablecoin Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Select the stablecoin and amount you want to trade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-foreground font-medium">Stablecoin</Label>
                <Select
                  value={formData.token}
                  onValueChange={(value) => handleInputChange('token', value)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {TRUSTLINES.map((trustline) => (
                      <SelectItem
                        key={trustline.address}
                        value={trustline.name}
                        className="hover:bg-glass-hover"
                      >
                        {trustline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground font-medium">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rate */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Exchange Rate</CardTitle>
            <CardDescription className="text-muted-foreground">
              Set your exchange rate and fiat currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-foreground font-medium">Rate per Token</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiatCurrency" className="text-foreground font-medium">Fiat Currency</Label>
                <Select
                  value={formData.fiatCurrency}
                  onValueChange={(value) =>
                    handleInputChange('fiatCurrency', value)
                  }
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="CRC" className="hover:bg-glass-hover">CRC - Costa Rican Colón</SelectItem>
                    <SelectItem value="MXN" className="hover:bg-glass-hover">MXN - Mexican Peso</SelectItem>
                    <SelectItem value="USD" className="hover:bg-glass-hover">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.amount && formData.rate && (
              <div className="glass-card bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-emerald-600">Total Value</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {calculateTotal()} {formData.fiatCurrency}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your preferred fiat payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-foreground font-medium">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleInputChange('paymentMethod', value)
                }
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="SINPE" className="hover:bg-glass-hover">SINPE (Costa Rica)</SelectItem>
                  <SelectItem value="SPEI" className="hover:bg-glass-hover">SPEI (Mexico)</SelectItem>
                  <SelectItem value="Bank Transfer" className="hover:bg-glass-hover">Bank Transfer</SelectItem>
                  <SelectItem value="Cash Deposit" className="hover:bg-glass-hover">Cash Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-foreground font-medium">Min Amount (Optional)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.minAmount}
                  onChange={(e) =>
                    handleInputChange('minAmount', e.target.value)
                  }
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-foreground font-medium">Max Amount (Optional)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    handleInputChange('maxAmount', e.target.value)
                  }
                  className="glass-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription className="text-muted-foreground">
              Add any additional information for traders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any special instructions or requirements..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                rows={3}
                className="glass-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Escrow Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Trustless Work Escrow
                </h4>
                <p className="text-sm text-blue-700">
                  Once your listing is accepted by the trader, a Trustless Work
                  escrow contract will be created. This ensures secure,
                  milestone-based trading with dispute resolution capabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/dashboard/listings" className="flex-1">
            <Button variant="outline" className="w-full glass-button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 btn-emerald"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
