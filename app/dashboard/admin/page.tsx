'use client';

import {
  AlertCircle,
  CheckCircle,
  Coins,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { TokenIcon } from '@/components/token-icon';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPage() {
  const [mintForm, setMintForm] = useState({
    token: '',
    amount: '',
    recipient: '',
    memo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const [tokens] = useState([
    {
      symbol: 'CRCX',
      name: 'Costa Rican Colón Token',
      totalSupply: 1000000,
      circulating: 750000,
      issuer: 'GDXXX...XXXX',
      status: 'active',
    },
    {
      symbol: 'MXNX',
      name: 'Mexican Peso Token',
      totalSupply: 500000,
      circulating: 320000,
      issuer: 'GDYYY...YYYY',
      status: 'active',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      totalSupply: 0, // External token
      circulating: 0,
      issuer: 'External',
      status: 'supported',
    },
  ]);

  const [recentTransactions] = useState([
    {
      id: 'TX001',
      type: 'mint',
      token: 'CRCX',
      amount: 10000,
      recipient: '0x1234...5678',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
    },
    {
      id: 'TX002',
      type: 'burn',
      token: 'MXNX',
      amount: 5000,
      recipient: '0x8765...4321',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'completed',
    },
    {
      id: 'TX003',
      type: 'mint',
      token: 'CRCX',
      amount: 25000,
      recipient: '0x9876...1234',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'pending',
    },
  ]);

  const [platformStats] = useState({
    totalUsers: 1247,
    activeListings: 23,
    totalVolume: 2450000,
    completedTrades: 156,
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Minting:', mintForm);
    setIsLoading(false);
    setMintForm({ token: '', amount: '', recipient: '', memo: '' });
  };

  const handleBurn = async (token: string, amount: number) => {
    console.log('Burning:', { token, amount });
    // Handle burn logic
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-600">
              Manage stablecoins and platform operations
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-sm text-green-600 mt-1">+12% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.activeListings}
              </div>
              <p className="text-sm text-blue-600 mt-1">Across all tokens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${platformStats.totalVolume.toLocaleString()}
              </div>
              <p className="text-sm text-green-600 mt-1">+25% this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformStats.completedTrades}
              </div>
              <p className="text-sm text-gray-600 mt-1">98.5% success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="tokens" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tokens">Token Management</TabsTrigger>
            <TabsTrigger value="mint">Mint/Burn</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Managed Tokens</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Token
              </Button>
            </div>

            <div className="grid gap-4">
              {tokens.map((token) => (
                <Card key={token.symbol}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <TokenIcon token={token.symbol} size="lg" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {token.symbol}
                          </h3>
                          <p className="text-gray-600">{token.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total Supply</p>
                          <p className="font-semibold">
                            {token.totalSupply > 0
                              ? token.totalSupply.toLocaleString()
                              : 'External'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Circulating</p>
                          <p className="font-semibold">
                            {token.circulating > 0
                              ? token.circulating.toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge
                            variant={
                              token.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {token.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        {token.issuer !== 'External' && (
                          <Button variant="outline" size="sm">
                            <Coins className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mint" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mint Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Mint Tokens
                  </CardTitle>
                  <CardDescription>
                    Issue new stablecoin tokens to a recipient
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMint} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mint-token">Token</Label>
                      <Select
                        value={mintForm.token}
                        onValueChange={(value) =>
                          setMintForm((prev) => ({ ...prev, token: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select token to mint" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CRCX">
                            CRCX - Costa Rican Colón Token
                          </SelectItem>
                          <SelectItem value="MXNX">
                            MXNX - Mexican Peso Token
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mint-amount">Amount</Label>
                      <Input
                        id="mint-amount"
                        type="number"
                        placeholder="0.00"
                        value={mintForm.amount}
                        onChange={(e) =>
                          setMintForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mint-recipient">Recipient Address</Label>
                      <Input
                        id="mint-recipient"
                        placeholder="GDXXX...XXXX"
                        value={mintForm.recipient}
                        onChange={(e) =>
                          setMintForm((prev) => ({
                            ...prev,
                            recipient: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mint-memo">Memo (Optional)</Label>
                      <Textarea
                        id="mint-memo"
                        placeholder="Reason for minting..."
                        value={mintForm.memo}
                        onChange={(e) =>
                          setMintForm((prev) => ({
                            ...prev,
                            memo: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Minting...' : 'Mint Tokens'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Burn Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Burn Tokens
                  </CardTitle>
                  <CardDescription>
                    Remove tokens from circulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">
                          Burn Tokens
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Burning tokens permanently removes them from
                        circulation. This action cannot be undone.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {tokens
                        .filter((t) => t.issuer !== 'External')
                        .map((token) => (
                          <div
                            key={token.symbol}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <TokenIcon token={token.symbol} size="sm" />
                              <div>
                                <p className="font-medium">{token.symbol}</p>
                                <p className="text-sm text-gray-600">
                                  Circulating:{' '}
                                  {token.circulating.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBurn(token.symbol, 1000)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Burn
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>

            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'mint'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {tx.type === 'mint' ? (
                            <Plus className="w-5 h-5" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === 'mint' ? 'Minted' : 'Burned'}{' '}
                            {tx.amount.toLocaleString()} {tx.token}
                          </p>
                          <p className="text-sm text-gray-600">
                            {tx.type === 'mint' ? 'To' : 'From'}: {tx.recipient}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {tx.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                          <Badge
                            variant={
                              tx.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  User management features coming soon
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This section will include user verification, KYC management,
                  and account controls
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
