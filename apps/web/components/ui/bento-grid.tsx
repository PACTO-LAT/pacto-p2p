import { ArrowRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[20rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  className?: string;
  background?: ReactNode;
  href?: string;
  cta?: string;
}

export function BentoCard({
  name,
  description,
  Icon,
  className,
  background,
  href,
  cta,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-xl',
        'bg-card border border-border/50',
        'transform-gpu transition-all duration-300',
        'hover:shadow-lg hover:border-border',
        className
      )}
    >
      {/* Background element - positioned at top */}
      <div className="absolute inset-0">{background}</div>

      {/* Content - positioned at bottom */}
      <div className="relative z-10 p-5 pt-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">{name}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {href && cta && (
          <a
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white hover:underline"
          >
            {cta}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
