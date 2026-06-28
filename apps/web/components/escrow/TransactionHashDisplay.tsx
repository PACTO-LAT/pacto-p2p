import { ExternalLink } from 'lucide-react';
import type { EscrowTransactionHashes } from '@/lib/services/trades';

interface TransactionHashLinkProps {
  label: string;
  hash: string | null | undefined;
  network?: 'testnet' | 'mainnet';
}

/**
 * Displays a transaction hash as a clickable link to Stellar Expert explorer
 */
export function TransactionHashLink({
  label,
  hash,
  network = 'testnet',
}: TransactionHashLinkProps) {
  if (!hash) return null;

  const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${hash}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground min-w-[80px]">
        {label}:
      </span>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm font-mono text-emerald-600 hover:text-emerald-500 transition-colors break-all"
      >
        <span className="truncate max-w-[200px]">
          {hash.slice(0, 8)}...{hash.slice(-8)}
        </span>
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>
    </div>
  );
}

interface EscrowTransactionHashesDisplayProps {
  transactionHashes: EscrowTransactionHashes | null | undefined;
  network?: 'testnet' | 'mainnet';
}

/**
 * Displays all transaction hashes for an escrow
 */
export function EscrowTransactionHashesDisplay({
  transactionHashes,
  network = 'testnet',
}: EscrowTransactionHashesDisplayProps) {
  if (!transactionHashes || Object.keys(transactionHashes).length === 0) {
    return null;
  }

  const actions = [
    { key: 'init' as const, label: 'Initialize' },
    { key: 'fund' as const, label: 'Fund' },
    { key: 'report' as const, label: 'Report Payment' },
    { key: 'release' as const, label: 'Release' },
    { key: 'dispute' as const, label: 'Dispute' },
  ];

  const hasAnyHash = actions.some((action) => transactionHashes[action.key]);

  if (!hasAnyHash) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-lg text-foreground">
        Blockchain Transactions
      </h4>
      <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg border border-border/50 space-y-2">
        {actions.map((action) => (
          <TransactionHashLink
            key={action.key}
            label={action.label}
            hash={transactionHashes[action.key]}
            network={network}
          />
        ))}
      </div>
    </div>
  );
}
