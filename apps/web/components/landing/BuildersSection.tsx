'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  CreditCard,
  ExternalLink,
  Github,
  Package,
  Plug,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BuildersSection() {
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

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
            <Plug className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Developer Friendly
            </span>
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-emerald-600 bg-clip-text text-transparent"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            For Builders & Issuers
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            Want to add your own stablecoin or corridor? Integrate with our
            platform in minutes, not months.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Steps */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={shouldAnimate ? fadeInLeft : {}}
          >
            <motion.div
              className="space-y-6"
              variants={shouldAnimate ? staggerContainer : {}}
            >
              {[
                {
                  step: '1',
                  title: 'Plug in Your Token',
                  description:
                    'Add your stablecoin via a simple configuration file. Support for any Stellar-based asset.',
                  icon: Package,
                },
                {
                  step: '2',
                  title: 'Use Our Escrow Engine',
                  description:
                    'Leverage Trustless Work, our battle-tested Stellar-based escrow system.',
                  icon: ShieldCheck,
                },
                {
                  step: '3',
                  title: 'Add Payment Methods',
                  description:
                    'Integrate your preferred fiat payment rails and start trading immediately.',
                  icon: CreditCard,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="group relative"
                  variants={shouldAnimate ? itemAnimation : {}}
                >
                  <div className="flex items-start gap-6">
                    {/* Step Number with Icon */}
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-2xl blur-lg group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <item.icon className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Connection line */}
                  {index < 2 && (
                    <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-emerald-500/30 to-transparent"></div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                <Github className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
              <Button
                className="btn-waitlist text-accent"
                style={{ padding: '0.5rem 1rem' }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </motion.div>

          {/* Right: Code Example */}
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={shouldAnimate ? fadeInRight : {}}
          >
            <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-700/30 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">
                  Quick Integration
                </h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-lg p-4">
                  <pre className="text-sm text-foreground">
                    <code>
                      {`// Add your token to Pacto
const config = {
  asset: "YOUR_TOKEN",
  issuer: "YOUR_ISSUER",
  paymentMethods: ["SINPE", "SPEI"],
  region: "Your Country"
};

// That's it! Your token is now live.`}
                    </code>
                  </pre>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Integration takes less than 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4">
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Built by Trustless Work
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
