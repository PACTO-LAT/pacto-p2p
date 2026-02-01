'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const STEP_LABELS = [
  'Type & Asset',
  'Pricing',
  'Payment',
  'Review',
] as const;

type Step = 1 | 2 | 3 | 4;

interface CreateListingProgressProps {
  currentStep: Step;
  className?: string;
}

export function CreateListingProgress({
  currentStep,
  className,
}: CreateListingProgressProps) {
  const value = (currentStep / 4) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Step {currentStep} of 4
        </span>
        <span className="text-muted-foreground">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
