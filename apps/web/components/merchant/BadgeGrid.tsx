'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="feature-card-dark rounded-2xl p-4 transition-transform hover:scale-[1.01]">
                  <div className="text-sm font-medium text-foreground">
                    {b.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {b.code}
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
