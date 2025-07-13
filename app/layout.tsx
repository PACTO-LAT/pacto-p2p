import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TrustlessWorkProvider } from "@/providers/trustless-work";
import { EscrowProvider } from "@/lib/contexts/escrow-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pacto - Decentralized P2P Trading",
  description:
    "Trade Stellar-based stablecoins with trustless escrow protection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TrustlessWorkProvider>
              <EscrowProvider>{children}</EscrowProvider>
            </TrustlessWorkProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
