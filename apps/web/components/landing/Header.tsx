'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-glass-border glass-effect backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="w-20 h-10 rounded-xl flex items-center justify-center logo-glow overflow-hidden">
              <Image
                src="/logo.webp"
                alt="Pacto Logo"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground ml-4">
              P2P OTC for Stellar Stablecoins
            </p>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
          <Link href="/auth">
            <Button className="btn-primary text-accent w-full justify-center sm:w-auto">
              Beta Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
