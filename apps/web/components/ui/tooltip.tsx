'use client';

import type React from 'react';

// Minimal tooltip shims to avoid external dependency during mocks.
// Renders children directly; TooltipContent renders a visually hidden span for accessibility.

const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const TooltipTrigger = ({
  children,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => (
  <>{children}</>
);

const TooltipContent = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
