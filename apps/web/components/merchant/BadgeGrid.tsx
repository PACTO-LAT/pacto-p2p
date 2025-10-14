'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MerchantBadge } from '@/lib/types/merchant';

export function BadgeGrid({ badges }: { badges: MerchantBadge[] }) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {badges.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="rounded-2xl p-4 bg-gradient-to-b from-background to-muted/40 border border-border/50 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                      {(b.code || b.title).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">{b.title}</div>
                        <UiBadge variant="secondary" className="whitespace-nowrap">{b.code}</UiBadge>
                      </div>
                      {b.description ? (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {b.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              {b.description ? (
                <TooltipContent>{b.description}</TooltipContent>
              ) : null}
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}
