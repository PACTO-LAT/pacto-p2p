'use client';

import { motion, useReducedMotion } from 'framer-motion';

const howItWorks = [
  {
    step: '1',
    title: 'Browse OTC Listings',
    description: 'Find offers to buy or sell stablecoins like CRCX or USDC.',
  },
  {
    step: '2',
    title: 'Enter Escrow Contract',
    description:
      'The crypto is locked in a Stellar-based smart contract. You send fiat off-chain (e.g., via SINPE). The seller confirms.',
  },
  {
    step: '3',
    title: 'Receive Your Crypto',
    description:
      'Once both sides approve, the smart contract automatically releases the funds.',
  },
];

export function HowItWorksSection() {
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
        staggerChildren: 0.1,
      },
    },
  };

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
            Simple 3-Step Process
          </span>
        </motion.div>
        <motion.h2
          className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white  to-slate-300 bg-clip-text text-transparent"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          How Pacto Works
        </motion.h2>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Get started in just three simple steps
        </motion.p>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        {/* Desktop: Horizontal Steps */}
        <div className="hidden lg:block relative">
          {/* Connection line */}
          <div className="absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-400/30 via-emerald-500/50 to-emerald-600/30"></div>

          <motion.div
            className="grid grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={shouldAnimate ? staggerContainer : {}}
          >
            {howItWorks.map((step) => (
              <motion.div
                key={step.step}
                className="group relative"
                variants={shouldAnimate ? itemAnimation : {}}
              >
                {/* Step Number with enhanced styling */}
                <div className="text-center mb-8 relative">
                  <div className="absolute inset-0 w-20 h-20 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                  <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-white font-bold text-2xl shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    {step.step}
                  </div>
                </div>

                {/* Enhanced Content Card - Glassmorphism Style */}
                <div className="glass-card-landing relative overflow-hidden rounded-2xl p-8">
                  {/* Top accent line - White/Glass style */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/30 via-white/50 to-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: Vertical Steps */}
        <div className="lg:hidden space-y-8">
          {howItWorks.map((step) => (
            <div key={step.step} className="group relative">
              <div className="flex items-start gap-6">
                {/* Enhanced Step Number */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-xl blur-lg group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    {step.step}
                  </div>
                </div>

                {/* Enhanced Content - Glassmorphism Style */}
                <div className="glass-card-landing flex-1 relative overflow-hidden rounded-xl p-6">
                  {/* Top accent line - White/Glass style */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/30 via-white/50 to-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-full border border-emerald-200 dark:border-emerald-700/50 shadow-lg">
          <span className="text-emerald-800 dark:text-emerald-200 font-medium">
            🔗 Escrow logic is fully programmable, trustless, and on-chain
          </span>
        </div>
      </div>
    </section>
  );
}
