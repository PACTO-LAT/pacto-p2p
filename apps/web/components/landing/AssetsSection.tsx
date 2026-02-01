'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Globe2,
  Search,
} from 'lucide-react';

import { getSupportedAssets } from '@/lib/supported-assets';
import { TokenIcon } from '@/components/shared/TokenIcon';
import { Card, CardContent } from '@/components/ui/card';

export function AssetsSection() {
  const reducedMotion = useReducedMotion();
  const supportedAssets = getSupportedAssets();
  const regionCount = new Set(supportedAssets.map((a) => a.region)).size;
  const regionOptions = [...new Set(supportedAssets.map((a) => a.region))].sort();

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
    <section
      className="container mx-auto px-6 py-24"
      aria-label="Supported assets and countries"
    >
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
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-600 font-medium text-sm">
            Global Coverage
          </span>
        </motion.div>
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Assets & Countries
        </motion.h2>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          variants={shouldAnimate ? itemAnimation : {}}
        >
          Explore our supported stablecoins and regional payment methods
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Controls Row */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={shouldAnimate ? fadeInUp : {}}
        >
          {/* Search with enhanced styling */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search assets by symbol or name..."
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Enhanced Filters */}
          <div className="flex gap-3">
            <div className="relative group">
              <select className="px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500 transition-all duration-300 appearance-none pr-10 text-foreground">
                <option value="">All Regions</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={shouldAnimate ? staggerContainer : {}}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-4 text-center"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <div className="text-2xl font-bold text-emerald-500">
              {supportedAssets.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </motion.div>
          <motion.div
            className="bg-card border border-border rounded-xl p-4 text-center"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <div className="text-2xl font-bold text-emerald-500">
              3
            </div>
            <div className="text-sm text-muted-foreground">Regions</div>
          </motion.div>
          <motion.div
            className="bg-card border border-border rounded-xl p-4 text-center"
            variants={shouldAnimate ? itemAnimation : {}}
          >
            <div className="text-2xl font-bold text-emerald-500">
              100%
            </div>
            <div className="text-sm text-muted-foreground">Live Status</div>
          </motion.div>
        </motion.div>

        {/* Enhanced Desktop Table */}
        <motion.div
          className="hidden lg:block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={shouldAnimate ? fadeInUp : {}}
        >
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-emerald-500 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        Asset
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-emerald-500 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        Region
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Payment Methods
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {supportedAssets.map((asset) => (
                    <tr
                      key={asset.symbol}
                      className="group hover:bg-muted/50 transition-all duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <TokenIcon token={asset.symbol} size="lg" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-emerald-800"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                              {asset.symbol}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {asset.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <Globe2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-foreground font-medium">
                            {asset.region}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {asset.paymentMethods.split(', ').map((method) => (
                            <span
                              key={method}
                              className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors duration-300"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium rounded-full border border-green-500/20">
                            Live
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all duration-300"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all duration-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Mobile Cards */}
        <motion.div
          className="lg:hidden space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={shouldAnimate ? staggerContainer : {}}
        >
          {supportedAssets.map((asset) => (
            <motion.div
              key={asset.symbol}
              variants={shouldAnimate ? itemAnimation : {}}
            >
              <Card className="group bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-400/40">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <TokenIcon token={asset.symbol} size="lg" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-emerald-800"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                          {asset.symbol}
                        </h3>
                        <p className="text-muted-foreground">{asset.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium rounded-full border border-green-500/20">
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <Globe2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-foreground font-medium">
                        {asset.region}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-3">
                        Payment Methods
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {asset.paymentMethods.split(', ').map((method) => (
                          <span
                            key={method}
                            className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors duration-300"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        className="flex-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Symbol
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Pagination */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              1-{supportedAssets.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">
              {supportedAssets.length}
            </span>{' '}
            assets
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-all duration-300 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
            >
              1
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-all duration-300 flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
