'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, Globe, Lock, Zap } from 'lucide-react';

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { name: 'SINPE', country: 'CR' },
  { name: 'SPEI', country: 'MX' },
  { name: 'PIX', country: 'BR' },
  { name: 'Nequi', country: 'CO' },
];

const tokens = ['CRCX', 'MXNX', 'USDC'];

const countries = [
  { flag: '🇨🇷', code: 'cr' },
  { flag: '🇲🇽', code: 'mx' },
  { flag: '🇨🇴', code: 'co' },
  { flag: '🇵🇪', code: 'pe' },
  { flag: '🇧🇷', code: 'br' },
  { flag: '🇦🇷', code: 'ar' },
];

const features = [
  {
    Icon: Globe,
    name: 'Local Payment Rails',
    description: 'Trade using SINPE, SPEI and other regional methods.',
    href: '#',
    cta: 'View methods',
    className: 'md:col-span-1 lg:col-span-1',
    background: (
      <div className="absolute top-4 left-0 right-0 bottom-24 flex justify-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)]">
        <div className="flex flex-col gap-2">
          {paymentMethods.map((method, idx) => (
            <div
              key={method.name}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-2',
                'border-border/40 bg-muted/50',
                'transition-transform duration-500',
                idx % 2 === 0 ? 'translate-x-3' : '-translate-x-3',
                'group-hover:translate-x-0'
              )}
            >
              <span className="text-xs font-medium text-muted-foreground w-6">
                {method.country}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {method.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    Icon: Lock,
    name: 'Trustless Escrows',
    description: 'Smart contracts hold funds until both parties confirm.',
    href: '#',
    cta: 'How it works',
    className: 'md:col-span-1 lg:col-span-2',
    background: (
      <div className="absolute top-8 left-0 right-0 bottom-24 flex items-center justify-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)]">
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <span className="text-xs lg:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                A
              </span>
            </div>
            <span className="text-[10px] lg:text-xs text-muted-foreground">Buyer</span>
          </div>

          <div className="flex items-center">
            <div className="h-px w-8 lg:w-16 bg-gradient-to-r from-emerald-500/50 to-primary/50" />
            <div className="h-2 w-2 rotate-45 border-t-2 border-r-2 border-primary/50 -ml-1" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl bg-primary/10 border-2 border-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Lock className="h-6 w-6 lg:h-7 lg:w-7 text-primary" />
            </div>
            <span className="text-[10px] lg:text-xs font-medium text-primary">Escrow</span>
          </div>

          <div className="flex items-center">
            <div className="h-2 w-2 rotate-45 border-b-2 border-l-2 border-primary/50 -mr-1" />
            <div className="h-px w-8 lg:w-16 bg-gradient-to-r from-primary/50 to-blue-500/50" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <span className="text-xs lg:text-sm font-semibold text-blue-600 dark:text-blue-400">
                B
              </span>
            </div>
            <span className="text-[10px] lg:text-xs text-muted-foreground">Seller</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: ArrowLeftRight,
    name: 'P2P OTC Market',
    description: 'Set your own rates. Trade directly with others.',
    href: '#',
    cta: 'Start trading',
    className: 'md:col-span-1 lg:col-span-2',
    background: (
      <div className="absolute top-0 left-0 right-0 bottom-24 flex items-center justify-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)]">
        <div className="flex gap-3 lg:gap-5">
          {tokens.map((token, idx) => (
            <div
              key={token}
              className={cn(
                'flex flex-col gap-1.5 rounded-xl border p-3 lg:p-4 w-[88px] lg:w-32',
                'border-border/40 bg-muted/50',
                'transition-all duration-300',
                'group-hover:scale-105',
                idx === 1 ? '-translate-y-3' : 'translate-y-3',
                idx === 1 && 'group-hover:-translate-y-5'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm font-bold text-foreground">
                  {token}
                </span>
                <span className="text-[10px] lg:text-xs text-emerald-500 font-medium">
                  +{(2.1 + idx * 0.3).toFixed(1)}%
                </span>
              </div>
              <div className="text-base lg:text-xl font-bold text-foreground">
                ${(1.0 + idx * 0.002).toFixed(3)}
              </div>
              <svg
                viewBox="0 0 80 24"
                className="w-full h-6 lg:h-8"
                aria-hidden="true"
              >
                <path
                  d={`M0,20 Q20,${16 - idx * 4} 40,${12 + idx * 2} T80,${6 - idx * 2}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-emerald-500/50"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    Icon: Zap,
    name: 'Cross-Border',
    description: 'Move value across LATAM instantly.',
    href: '#',
    cta: 'See coverage',
    className: 'md:col-span-1 lg:col-span-1',
    background: (
      <div className="absolute top-0 left-0 right-0 bottom-24 flex items-center justify-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent_100%)]">
        <div className="relative">
          <div className="grid grid-cols-3 grid-rows-2 gap-3">
            {countries.map((country, idx) => (
              <div
                key={country.code}
                className={cn(
                  'h-12 w-12 rounded-lg bg-muted/50 border border-border/40',
                  'flex items-center justify-center text-xl',
                  'transition-all duration-300',
                  'group-hover:scale-110',
                  idx % 2 === 0
                    ? 'group-hover:-translate-y-1'
                    : 'group-hover:translate-y-1'
                )}
              >
                {country.flag}
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-6 w-6 rounded-full bg-primary/25 animate-ping" />
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const reducedMotion = useReducedMotion();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const shouldAnimate = !reducedMotion;

  return (
    <section className="container mx-auto px-6 py-20 mt-20">
      <motion.div
        className="mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={shouldAnimate ? fadeIn : {}}
      >
        <span className="text-sm font-medium text-primary mb-3 block">
          Features
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Trade stablecoins your way
        </h2>
        <p className="text-muted-foreground max-w-xl">
          A non-custodial P2P marketplace built for LATAM, powered by Stellar.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={shouldAnimate ? fadeIn : {}}
      >
        <BentoGrid>
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </motion.div>
    </section>
  );
}
