'use client';

import { AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { Token } from '@/lib/types/admin';

interface BurnFormProps {
  tokens: Token[];
  onBurn: (token: string, amount: number) => void;
}

export function BurnForm({ tokens, onBurn }: BurnFormProps) {
  const burnableTokens = tokens.filter((t) => t.issuer !== 'External');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Burn Tokens
        </CardTitle>
        <CardDescription>Remove tokens from circulation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Burn Tokens</span>
            </div>
            <p className="text-sm text-yellow-700">
              Burning tokens permanently removes them from circulation. This
              action cannot be undone.
            </p>
          </div>

          <div className="space-y-3">
            {burnableTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <TokenIcon token={token.symbol} size="sm" />
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-gray-600">
                      Circulating: {token.circulating.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBurn(token.symbol, 1000)}
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
  );
}
