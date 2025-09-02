'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function CTASection() {
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
    <section className="container mx-auto px-6 py-24">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={shouldAnimate ? staggerContainer : {}}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Join thousands of traders
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground/90 to-emerald-600 bg-clip-text text-transparent leading-tight"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            Ready to Start Trading?
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            Join the decentralized P2P revolution and start trading stablecoins
            with complete trust and transparency.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            variants={shouldAnimate ? staggerContainer : {}}
          >
            <motion.div
              className="text-center"
              variants={shouldAnimate ? itemAnimation : {}}
            >
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                $2M+
              </div>
              <div className="text-sm text-muted-foreground">Volume Traded</div>
            </motion.div>
            <motion.div
              className="text-center"
              variants={shouldAnimate ? itemAnimation : {}}
            >
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                1,500+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Traders
              </div>
            </motion.div>
            <motion.div
              className="text-center"
              variants={shouldAnimate ? itemAnimation : {}}
            >
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="mr-3">Start Trading Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>

            <Link href="/auth">
              <Button className="btn-waitlist text-accent">
                <span className="mr-2">📖</span>
                Browse Listings
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-12 pt-8 border-t border-white/10 dark:border-white/10"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by traders across LATAM
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">No KYC Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Instant Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
