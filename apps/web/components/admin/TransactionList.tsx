'use client';

import { TransactionCard } from './TransactionCard';
import { Transaction } from '@/lib/types/admin';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Transactions</h2>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
