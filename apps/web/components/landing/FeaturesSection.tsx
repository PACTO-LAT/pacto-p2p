'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { DollarSign, Globe, Lock, Rocket } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: Globe,
    title: 'Local P2P On/Off-Ramps',
    description:
      'Easily trade CRCX, MXNX, or USDC using regional payment rails like SINPE or SPEI — directly with other users.',
  },
  {
    icon: Lock,
    title: 'Smart Contract Escrows',
    description:
      'Every trade is powered by Trustless Work, a Stellar-based escrow engine that holds funds until milestones are met.',
  },
  {
    icon: DollarSign,
    title: 'Fair, Transparent OTC Market',
    description:
      'You choose the price. Compete with other traders in a non-custodial environment.',
  },
  {
    icon: Rocket,
    title: 'Borderless & Stable',
    description:
      'Move value across borders and convert to local fiat on demand. Ideal for freelancers, merchants, and crypto-native LATAM users.',
  },
];

export function FeaturesSection() {
  const reducedMotion = useReducedMotion();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-emerald-600 font-medium text-sm">
            Core Features
          </span>
        </motion.div>
        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Why Choose Pacto?
        </motion.h2>
        <motion.p 
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Experience the future of P2P trading with our innovative platform
        </motion.p>
      </motion.div>
      
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={shouldAnimate ? staggerContainer : {}}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={shouldAnimate ? itemAnimation : {}}
            className="h-full"
          >
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
            >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400/50 to-emerald-600/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            
            <CardHeader className="text-center pb-6 relative z-10 flex-shrink-0">
              <div className="relative mx-auto mb-6">
                {/* Icon background glow */}
                <div className="absolute inset-0 w-16 h-16 bg-emerald-500/20 rounded-2xl blur-lg group-hover:bg-emerald-500/30 transition-all duration-500" />
                
                {/* Icon container */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <feature.icon className="w-8 h-8 text-white group-hover:scale-110 transition-all duration-300" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <CardTitle className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {feature.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center relative z-10 flex-1 flex flex-col justify-center">
              <CardDescription className="text-muted-foreground leading-relaxed text-base group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Bottom accent */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
            Powered by Stellar blockchain technology
          </span>
        </div>
      </div>
    </section>
  );
}
