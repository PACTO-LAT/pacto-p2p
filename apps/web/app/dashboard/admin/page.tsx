'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlatformStats,
  TokenManagement,
  MintForm,
  BurnForm,
  TransactionList,
  UserManagement,
  MerchantApplications,
} from '@/components/admin';
import {
  getDefaultTokens,
  getDefaultTransactions,
  getDefaultPlatformStats,
  getDefaultMintForm,
  validateMintForm,
} from '@/lib/admin-utils';
import type { Token, MintFormData } from '@/lib/types/admin';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mintForm, setMintForm] = useState<MintFormData>(getDefaultMintForm());
  const [isLoading, setIsLoading] = useState(false);
  const [tokens] = useState(getDefaultTokens());
  const [recentTransactions] = useState(getDefaultTransactions());
  const [platformStats] = useState(getDefaultPlatformStats());

  useEffect(() => {
    if (!loading && user?.user_type !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user?.user_type !== 'admin') return null;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateMintForm(mintForm);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    setIsLoading(true);

    // Simulate minting process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Minting:', mintForm);
    setIsLoading(false);
    setMintForm(getDefaultMintForm());
  };

  const handleBurn = async (token: string, amount: number) => {
    console.log('Burning:', { token, amount });
    // Handle burn logic
  };

  const handleAddToken = () => {
    console.log('Add new token');
    // Handle adding new token
  };

  const handleTokenSettings = (token: Token) => {
    console.log('Token settings:', token);
    // Handle token settings
  };

  const handleTokenMint = (token: Token) => {
    console.log('Quick mint for token:', token);
    // Handle quick mint
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">
            Manage stablecoins and platform operations
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <PlatformStats stats={platformStats} />

      {/* Main Admin Tabs */}
      <Tabs defaultValue="tokens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokens">Token Management</TabsTrigger>
          <TabsTrigger value="mint">Mint/Burn</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="merchant-applications">
            Merchant Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <TokenManagement
            tokens={tokens}
            onAddToken={handleAddToken}
            onTokenSettings={handleTokenSettings}
            onTokenMint={handleTokenMint}
          />
        </TabsContent>

        <TabsContent value="mint">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MintForm
              formData={mintForm}
              onFormChange={setMintForm}
              onSubmit={handleMint}
              isLoading={isLoading}
            />
            <BurnForm tokens={tokens} onBurn={handleBurn} />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={recentTransactions} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="merchant-applications">
          <MerchantApplications />
        </TabsContent>
      </Tabs>
    </div>
  );
}
