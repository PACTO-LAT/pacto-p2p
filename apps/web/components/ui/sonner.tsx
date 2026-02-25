'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sileo';

export function SileoToaster() {
  const { theme = 'system' } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={theme as 'light' | 'dark' | 'system'}
    />
  );
}

export { SileoToaster as Toaster };