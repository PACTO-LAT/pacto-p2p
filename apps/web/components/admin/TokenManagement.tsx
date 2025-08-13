'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenCard } from './TokenCard';
import { Token } from '@/lib/types/admin';

interface TokenManagementProps {
  tokens: Token[];
  onAddToken?: () => void;
  onTokenSettings?: (token: Token) => void;
  onTokenMint?: (token: Token) => void;
}

export function TokenManagement({
  tokens,
  onAddToken,
  onTokenSettings,
  onTokenMint,
}: TokenManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Managed Tokens</h2>
        {onAddToken && (
          <Button onClick={onAddToken}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Token
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {tokens.map((token) => (
          <TokenCard
            key={token.symbol}
            token={token}
            onSettings={onTokenSettings}
            onMint={onTokenMint}
          />
        ))}
      </div>
    </div>
  );
}
