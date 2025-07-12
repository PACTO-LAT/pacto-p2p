"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, TrendingUp, TrendingDown, User } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExternalLink } from "lucide-react"
import { TokenIcon } from "@/components/token-icon"
import { TradeTypeBadge } from "@/components/trade-type-badge"

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedToken, setSelectedToken] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedListing, setSelectedListing] = useState<any>(null)

  const [listings] = useState([
    {
      id: 1,
      type: "sell",
      token: "CRCX",
      amount: 1000,
      rate: 520.5,
      fiatCurrency: "CRC",
      paymentMethod: "SINPE",
      seller: "0x1234...5678",
      buyer: undefined,
      reputation: 4.8,
      trades: 23,
      created: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      type: "buy",
      token: "USDC",
      amount: 500,
      rate: 520.0,
      fiatCurrency: "CRC",
      paymentMethod: "Bank Transfer",
      seller: undefined,
      buyer: "0x8765...4321",
      reputation: 4.9,
      trades: 45,
      created: "2024-01-15",
      status: "active",
    },
    {
      id: 3,
      type: "sell",
      token: "MXNX",
      amount: 2000,
      rate: 18.5,
      fiatCurrency: "MXN",
      paymentMethod: "SPEI",
      seller: "0x9876...1234",
      buyer: undefined,
      reputation: 4.7,
      trades: 12,
      created: "2024-01-14",
      status: "active",
    },
    {
      id: 4,
      type: "buy",
      token: "CRCX",
      amount: 750,
      rate: 521.0,
      fiatCurrency: "CRC",
      paymentMethod: "SINPE",
      seller: undefined,
      buyer: "0x5432...8765",
      reputation: 4.6,
      trades: 8,
      created: "2024-01-14",
      status: "active",
    },
  ])

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.fiatCurrency.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesToken = selectedToken === "all" || listing.token === selectedToken
    const matchesType = selectedType === "all" || listing.type === selectedType

    return matchesSearch && matchesToken && matchesType
  })

  const handleTrade = (listing: any) => {
    setSelectedListing(listing)
  }

  const confirmTrade = () => {
    console.log("Confirming trade for listing:", selectedListing?.id)
    setSelectedListing(null)
  }

  const ListingCard = ({ listing }: { listing: any }) => (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <TradeTypeBadge type={listing.type} className="mb-3" />
                <TokenIcon token={listing.token} size="lg" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-3xl font-bold text-gray-900">{listing.amount.toLocaleString()}</h3>
                    <span className="text-xl font-semibold text-gray-600">{listing.token}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Tasa de Cambio</p>
                      <p className="text-gray-900 font-semibold">
                        {listing.rate} {listing.fiatCurrency}/{listing.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Método de Pago</p>
                      <p className="text-gray-900 font-semibold">{listing.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trader</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">
                          {listing.type === "sell" ? listing.seller : listing.buyer}
                        </span>
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          ⭐ {listing.reputation} ({listing.trades})
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900">{(listing.amount * listing.rate).toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-600">{listing.fiatCurrency}</p>
              </div>

              <Button
                onClick={() => handleTrade(listing)}
                className="bg-primary hover:bg-primary-600 px-8 py-2 text-base font-semibold"
              >
                {listing.type === "sell" ? "Comprar Ahora" : "Vender Ahora"}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Activo</span>
                </div>
                <span className="text-sm text-gray-500">
                  Publicado: {new Date(listing.created).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="bg-transparent border-gray-300">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver en Stellar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-gray-600">Browse and trade Stellar stablecoins</p>
          </div>
          <Link href="/listings/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by token or currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tokens</SelectItem>
                  <SelectItem value="CRCX">CRCX</SelectItem>
                  <SelectItem value="MXNX">MXNX</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy">Buy Orders</SelectItem>
                  <SelectItem value="sell">Sell Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{listings.length}</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,230</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Trade Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250</div>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Listings ({filteredListings.length})</TabsTrigger>
            <TabsTrigger value="buy">
              Buy Orders ({filteredListings.filter((l) => l.type === "buy").length})
            </TabsTrigger>
            <TabsTrigger value="sell">
              Sell Orders ({filteredListings.filter((l) => l.type === "sell").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buy" className="space-y-4">
            <div className="grid gap-4">
              {filteredListings
                .filter((l) => l.type === "buy")
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="grid gap-4">
              {filteredListings
                .filter((l) => l.type === "sell")
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Trade Confirmation Dialog */}
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initiate Trade</DialogTitle>
              <DialogDescription>
                {selectedListing && (
                  <>
                    You are about to {selectedListing.type === "sell" ? "buy" : "sell"} {selectedListing.amount}{" "}
                    {selectedListing.token}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedListing && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Trade Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      Amount: {selectedListing.amount.toLocaleString()} {selectedListing.token}
                    </p>
                    <p>
                      Rate: {selectedListing.rate} {selectedListing.fiatCurrency}/{selectedListing.token}
                    </p>
                    <p>
                      Total: {(selectedListing.amount * selectedListing.rate).toLocaleString()}{" "}
                      {selectedListing.fiatCurrency}
                    </p>
                    <p>Payment: {selectedListing.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedListing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmTrade} className="flex-1">
                    Confirm Trade
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
