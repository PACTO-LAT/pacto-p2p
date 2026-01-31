'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'border-glass-border glass-effect backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
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
