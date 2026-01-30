'use client';

import { MacbookScroll } from '@/components/ui/macbook-scroll';

export function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-visible bg-transparent [&_h2]:!hidden [&_h2]:!mb-0 [&>div]:!py-0 [&>div]:md:!py-32">
      <MacbookScroll
        title=""
        badge={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white dark:text-white font-medium text-xs">
              Live on Stellar
            </span>
          </div>
        }
        src="/lol.png"
        showGradient={false}
      />
    </div>
  );
}
