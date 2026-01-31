'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import WaitlistDialog from '@/components/marketing/WaitlistDialog';
import { Button } from '@/components/ui/button';
import RotatingText from '@/components/RotatingText';
import { MacbookScrollDemo } from '@/components/landing/MacbookScrollDemo';

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };
  const shouldAnimate = !reducedMotion;

  return (
    <section className="hero-section container mx-auto px-6 pt-24 pb-0 text-center relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="hero-glow"></div>
      <div className="hero-shape hero-shape-1"></div>
      <div className="hero-shape hero-shape-2"></div>
      <div className="hero-shape hero-shape-3"></div>

      <motion.div
        className="hero-content max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? staggerContainer : {}}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-8 hero-title"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Trade Stablecoins for Local Fiat — With{' '}
          <span className="text-emerald-400">Pacto</span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto leading-relaxed hero-subtitle"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          A decentralized OTC platform for Stellar stablecoins like{' '}
          <RotatingText
            texts={['CRCX', 'MXNX', 'USDC']}
            mainClassName="inline-flex items-center text-white font-semibold"
            staggerFrom="last"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-120%', opacity: 0 }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden inline-flex"
            elementLevelClassName="inline-block"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
          .
        </motion.p>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto hero-subtitle"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Buy and sell directly with peers in your country. No middlemen. No
          custodians.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          <Link href="/auth">
            <Button className="btn-primary btn-hero text-lg px-8 py-3 text-accent">
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <WaitlistDialog />
        </motion.div>
      </motion.div>
      
      {/* Macbook Mockup - visible directly in hero, scrolls down to next section */}
      <div className="relative z-0 -mt-8 md:-mt-16">
        <MacbookScrollDemo />
      </div>
    </section>
  );
}
