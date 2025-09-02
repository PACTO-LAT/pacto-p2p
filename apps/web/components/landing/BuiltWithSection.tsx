'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, Layers, Package } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const techStack = [
  {
    name: 'Open Source',
    description: 'Modular frontend powering P2P listings and flows',
    category: 'Frontend',
    tags: ['React', 'Next.js', 'TypeScript'],
    link: 'https://github.com',
  },
  {
    name: 'Trustless Work',
    description: 'Stellar based escrow engine for stablecoins',
    category: 'Core',
    tags: ['Stellar', 'Escrow', 'Smart Contracts'],
    link: 'https://trustless.work',
  },
  {
    name: 'Soroban',
    description:
      'Stellar native smart contract platform, built to integrate seamlessly with the Stellar network',
    category: 'Core',
    tags: ['Stellar', 'Smart Contracts', 'Rust'],
    link: 'https://soroban.stellar.org',
  },
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

  const getDefaultIcon = (index: number) => {
    const icons = [Package, Cpu, Layers];
    return icons[index % icons.length];
  };

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
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Our production-ready tech stack powering the decentralized P2P
          revolution
        </motion.p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={shouldAnimate ? staggerContainer : {}}
      >
        {techStack.map((tech, index) => {
          const IconComponent = getDefaultIcon(index);

          return (
            <motion.div
              key={tech.name}
              variants={shouldAnimate ? itemAnimation : {}}
            >
              <Card className="group relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400/50 to-emerald-600/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <CardContent className="relative p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 mb-2">
                        {tech.name}
                      </h3>
                      {tech.category && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        >
                          {tech.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {tech.description}
                  </p>

                  {tech.tags && tech.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 dark:border-white/10">
                      {tech.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
