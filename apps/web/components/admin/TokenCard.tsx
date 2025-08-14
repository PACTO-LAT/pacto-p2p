'use client';

import { Coins, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { Token } from '@/lib/types/admin';

interface TokenCardProps {
  token: Token;
  onSettings?: (token: Token) => void;
  onMint?: (token: Token) => void;
}

export function TokenCard({ token, onSettings, onMint }: TokenCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon token={token.symbol} size="lg" />
            <div>
              <h3 className="font-semibold text-lg">{token.symbol}</h3>
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
                  token.status === 'active' ? 'default' : 'secondary'
                }
              >
                {token.status}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {onSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSettings(token)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            {token.issuer !== 'External' && onMint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMint(token)}
              >
                <Coins className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
