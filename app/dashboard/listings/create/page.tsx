"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Calculator, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TokenIcon } from "@/components/token-icon"

export default function CreateListingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "sell",
    token: "",
    amount: "",
    rate: "",
    fiatCurrency: "",
    paymentMethod: "",
    minAmount: "",
    maxAmount: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    router.push("/dashboard")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    const amount = Number.parseFloat(formData.amount) || 0
    const rate = Number.parseFloat(formData.rate) || 0
    return (amount * rate).toFixed(2)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/listings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Listing</h1>
            <p className="text-gray-600">Create a new OTC trade listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Type */}
          <Card>
            <CardHeader>
              <CardTitle>Trade Type</CardTitle>
              <CardDescription>Choose whether you want to buy or sell stablecoins</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="sell" id="sell" className="peer sr-only" />
                  <Label
                    htmlFor="sell"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Sell</div>
                      <div className="text-sm text-gray-600">I want to sell my stablecoins for fiat</div>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="buy" id="buy" className="peer sr-only" />
                  <Label
                    htmlFor="buy"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Buy</div>
                      <div className="text-sm text-gray-600">I want to buy stablecoins with fiat</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Token Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Stablecoin Details</CardTitle>
              <CardDescription>Select the stablecoin and amount you want to trade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Stablecoin</Label>
                  <Select value={formData.token} onValueChange={(value) => handleInputChange("token", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRCX">CRCX - Costa Rican Colón Token</SelectItem>
                      <SelectItem value="MXNX">MXNX - Mexican Peso Token</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate</CardTitle>
              <CardDescription>Set your exchange rate and fiat currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Token</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rate}
                    onChange={(e) => handleInputChange("rate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiatCurrency">Fiat Currency</Label>
                  <Select
                    value={formData.fiatCurrency}
                    onValueChange={(value) => handleInputChange("fiatCurrency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRC">CRC - Costa Rican Colón</SelectItem>
                      <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.amount && formData.rate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {calculateTotal()} {formData.fiatCurrency}
                  </p>
                  <TokenIcon token={formData.token} size="md" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose your preferred fiat payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINPE">SINPE (Costa Rica)</SelectItem>
                    <SelectItem value="SPEI">SPEI (Mexico)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Min Amount (Optional)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.minAmount}
                    onChange={(e) => handleInputChange("minAmount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Max Amount (Optional)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.maxAmount}
                    onChange={(e) => handleInputChange("maxAmount", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Add any additional information for traders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any special instructions or requirements..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
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
                  <h4 className="font-medium text-blue-900 mb-1">Trustless Work Escrow</h4>
                  <p className="text-sm text-blue-700">
                    Your listing will automatically create a Trustless Work escrow contract when a trader accepts your
                    offer. This ensures secure, milestone-based trading with dispute resolution capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/listings" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating Listing..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
