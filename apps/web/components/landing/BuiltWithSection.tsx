'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LogoLoop } from '@/components/ui/logo-loop';

// Logos disponibles en /public
const logos = [
  {
    src: '/soroban-logo.png',
    alt: 'Soroban',
    title: 'Soroban Smart Contracts',
    href: 'https://soroban.stellar.org',
  },
  {
    src: '/github-logo.png',
    alt: 'GitHub',
    title: 'Open Source on GitHub',
    href: 'https://github.com',
  },
  {
    src: '/trustless-logo.png',
    alt: 'Trustless Work',
    title: 'Trustless Work Escrow Engine',
    href: 'https://trustless.work',
  }
];

export function BuiltWithSection() {
  const reducedMotion = useReducedMotion();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
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
    <section className="container mx-auto px-6 py-20">
      <motion.div
        className="text-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={shouldAnimate ? fadeInUp : {}}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Production Ready
          </span>
        </motion.div>
        <motion.h2
          className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Built With
        </motion.h2>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Our production-ready tech stack powering the decentralized P2P revolution
        </motion.p>
      </motion.div>

      {/* Logo Loop Animation - Centered */}
      <div className="relative flex justify-center">
        <div className="mt-8" style={{ height: '120px', width: '650px', position: 'relative', overflow: 'hidden' }}>
          <LogoLoop
            logos={logos}
            speed={40}
            direction="left"
            logoHeight={95}
            gap={70}
            hoverSpeed={0}
            scaleOnHover={true}
            fadeOut={false}
            ariaLabel="Technology partners"
            width="100%"
          />
        </div>
      </div>
    </section>
  );
}
