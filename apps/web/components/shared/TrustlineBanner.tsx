'use client';

import { AlertTriangle, ExternalLink, Info } from 'lucide-react';
import type { TrustlineError } from '@/utils/stellar/TrustlineError';

interface TrustlineBannerProps {
  error: TrustlineError;
}

export function TrustlineBanner({ error }: TrustlineBannerProps) {
  const isBuyer = error.role === 'buyer';
  const docsUrl =
    'https://docs.trustlesswork.com/trustless-work/introduction/stellar-and-soroban-the-backbone-of-trustless-work/trustlines';

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 space-y-3">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
        <p className="font-semibold text-amber-300 text-sm">
          Missing Trustline — {error.assetCode}
        </p>
      </div>

      {/* Description */}
      <p className="text-amber-100/90 text-sm leading-relaxed">
        {isBuyer ? (
          <>
            Your wallet does not have a{' '}
            <span className="font-semibold">{error.assetCode}</span> trustline.
            You must add it before this trade can proceed.
          </>
        ) : (
          <>
            The seller&apos;s wallet does not have a{' '}
            <span className="font-semibold">{error.assetCode}</span> trustline.
            They must set it up before this escrow can be funded.
          </>
        )}
      </p>

      {/* Step-by-step guide for the buyer */}
      {isBuyer && (
        <div className="space-y-1.5">
          <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
            <Info className="h-3 w-3" /> How to add a trustline
          </p>
          <ol className="list-decimal list-inside space-y-1 text-amber-100/80 text-sm">
            <li>Open your Stellar wallet (Freighter, Albedo, etc.)</li>
            <li>Navigate to &quot;Assets&quot; or &quot;Trustlines&quot;</li>
            <li>
              Search for{' '}
              <span className="font-mono font-semibold">{error.assetCode}</span>{' '}
              and click &quot;Add&quot; or &quot;Trust&quot;
            </li>
            <li>Confirm the transaction (costs ~0.5 XLM reserve)</li>
            <li>Return here and retry the trade</li>
          </ol>
        </div>
      )}

      {/* External links */}
      <div className="flex flex-wrap gap-3 pt-1">
        {isBuyer && (
          <>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors"
            >
              Freighter
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://albedo.link/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors"
            >
              Albedo
              <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors"
        >
          Trustless Work Docs
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
