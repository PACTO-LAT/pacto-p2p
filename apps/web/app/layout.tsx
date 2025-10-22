import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import './globals.css';
import { AuthGuard } from '@/components/auth-guard';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { EscrowProvider } from '@/lib/contexts/escrow-context';
import { QueryProvider } from '@/providers/query-provider';
import { TrustlessWorkProvider } from '@/providers/trustless-work';
import { CrossmintProviders } from '@/providers/crossmint-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pacto - Decentralized P2P Trading',
  description:
    'Trade Stellar-based stablecoins with trustless escrow protection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-emerald-pattern min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
                  <QueryProvider>
                    <TrustlessWorkProvider>
                      <CrossmintProviders>
                        <EscrowProvider>
                          <AuthGuard>{children}</AuthGuard>
                        </EscrowProvider>
                      </CrossmintProviders>
                    </TrustlessWorkProvider>
                  </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
