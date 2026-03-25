'use client';

import { AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/lib/types/admin';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isMint = transaction.type === 'mint';
  const isCompleted = transaction.status === 'completed';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isMint
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {isMint ? (
                <Plus className="w-5 h-5" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isMint ? 'Minted' : 'Burned'}{' '}
                {transaction.amount.toLocaleString()} {transaction.token}
              </p>
              <p className="text-sm text-gray-600">
                {isMint ? 'To' : 'From'}: {transaction.recipient}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {new Date(transaction.timestamp).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(transaction.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
