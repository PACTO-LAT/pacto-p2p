'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
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
    <footer className="bg-transparent text-foreground py-16">
      <motion.div 
        className="container mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={shouldAnimate ? fadeInUp : {}}
      >
        <motion.div 
          className="text-center mb-12"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          <motion.div 
            className="flex items-center justify-center space-x-3 mb-6"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <div className="w-20 h-12 rounded-xl flex items-center justify-center logo-glow overflow-hidden">
              <Image
                src="/logo.webp"
                alt="Pacto Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Decentralized P2P OTC for Stellar stablecoins — built for LATAM.
              Open to the world.
            </p>
          </motion.div>
        </motion.div>
        <div></div>

        <motion.div 
          className="grid md:grid-cols-4 gap-8 ml-40"
          variants={shouldAnimate ? staggerContainer : {}}
        >
          <motion.div variants={shouldAnimate ? itemAnimation : {}}>
            <h4 className="font-bold mb-6 text-lg text-foreground">
              Platform
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/listings"
                  className="hover:text-foreground transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/escrows"
                  className="hover:text-foreground transition-colors"
                >
                  Orders
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={shouldAnimate ? itemAnimation : {}}>
            <h4 className="font-bold mb-6 text-lg text-foreground">
              Resources
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/docs"
                  className="hover:text-foreground transition-colors"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="https://twitter.com"
                  className="hover:text-foreground transition-colors"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={shouldAnimate ? itemAnimation : {}}>
            <h4 className="font-bold mb-6 text-lg text-foreground">Legal</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={shouldAnimate ? itemAnimation : {}}>
            <h4 className="font-bold mb-6 text-lg text-foreground">
              Support
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>
        <motion.div 
          className="border-t border-glass-border mt-12 pt-8 text-center text-muted-foreground"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          <p>&copy; 2024 Pacto. Built for the decentralized future.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
