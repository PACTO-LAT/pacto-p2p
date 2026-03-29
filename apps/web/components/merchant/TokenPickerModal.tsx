'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { TRUSTLINES } from '@/utils/constants/trustlines';
import { TokenIcon } from '@/components/shared/TokenIcon';

const AVAILABLE = TRUSTLINES.filter((t) => !!t.address);

interface TokenPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tokenName: string) => void;
  selected: string;
}

export function TokenPickerModal({
  open,
  onClose,
  onSelect,
  selected,
}: TokenPickerModalProps) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = AVAILABLE.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    onSelect(name);
    setSearch('');
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-semibold text-base">Select a token</span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-muted/30">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search tokens"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Token list */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No tokens found
            </p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => handleSelect(t.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                  selected === t.name ? 'bg-emerald-500/10' : ''
                }`}
              >
                <TokenIcon token={t.symbol} size="md" className="shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-none">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.issuerName ?? t.symbol}
                  </p>
                </div>
                {selected === t.name && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
