"use client";

import { ArrowRight, DollarSign, Globe, Lock, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TokenIcon } from "@/components/token-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const features = [
    {
      icon: Globe,
      title: "Local P2P On/Off-Ramps",
      description:
        "Easily trade CRCX, MXNX, or USDC using regional payment rails like SINPE or SPEI — directly with other users.",
    },
    {
      icon: Lock,
      title: "Smart Contract Escrows",
      description:
        "Every trade is powered by Trustless Work, a Stellar-based escrow engine that holds funds until milestones are met.",
    },
    {
      icon: DollarSign,
      title: "Fair, Transparent OTC Market",
      description:
        "You choose the price. Compete with other traders in a non-custodial environment.",
    },
    {
      icon: Rocket,
      title: "Borderless & Stable",
      description:
        "Move value across borders and convert to local fiat on demand. Ideal for freelancers, merchants, and crypto-native LATAM users.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Browse OTC Listings",
      description: "Find offers to buy or sell stablecoins like CRCX or USDC.",
    },
    {
      step: "2",
      title: "Enter Escrow Contract",
      description:
        "The crypto is locked in a Stellar-based smart contract. You send fiat off-chain (e.g., via SINPE). The seller confirms.",
    },
    {
      step: "3",
      title: "Receive Your Crypto",
      description:
        "Once both sides approve, the smart contract automatically releases the funds.",
    },
  ];

  const supportedAssets = [
    {
      symbol: "CRCX",
      name: "Costa Rican Colón Token",
      region: "Costa Rica",
      paymentMethods: "SINPE",
      color: "bg-green-500",
    },
    {
      symbol: "MXNX",
      name: "Mexican Peso Token",
      region: "Mexico",
      paymentMethods: "SPEI, OXXO (coming)",
      color: "bg-red-500",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      region: "Global",
      paymentMethods: "Varies",
      color: "bg-emerald-600",
    },
  ];

  const techStack = [
    {
      name: "Open Source",
      description: "Modular frontend powering P2P listings and flows",
    },
    {
      name: "Trustless Work",
      description: "Stellar based escrow engine for stablecoins",
    },
    {
      name: "Soroban",
      description:
        "Stellar native smart contract platform, built to integrate seamlessly with the Stellar network",
    },
  ];

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Header */}
      <header className="border-b border-glass-border glass-effect backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
            <div className="w-20 h-10 rounded-xl flex items-center justify-center logo-glow overflow-hidden">
              <Image
                src="/logo.webp"
                alt="Pacto Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>              <p className="text-xs text-muted-foreground">
                P2P OTC for Stellar Stablecoins
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* <ThemeToggle /> */}
            <Link href="/auth">
              <Button
                variant="outline"
                className="glass-effect-light hover:bg-glass-hover text-foreground/80"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="btn-primary">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 hero-title">
            Trade Stablecoins for Local Fiat — With{" "}
            <span className="text-emerald-400">Pacto</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto leading-relaxed hero-subtitle">
            A decentralized OTC platform for Stellar stablecoins like{" "}
            <span className="text-emerald-400 font-semibold">
              CRCX, MXNX, and USDC
            </span>
            .
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto hero-subtitle">
            Buy and sell directly with peers in your country. No middlemen. No
            custodians.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button className="btn-primary text-lg px-8 py-3">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="btn-secondary text-lg px-8 py-3"
            >
              How Pacto Works
            </Button>
          </div>

          <Badge className="glass-effect text-zinc-200 border-glass-border text-base px-6 py-2">
            Why Use Pacto?
          </Badge>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Card key={index} className="feature-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-emerald-400" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How Pacto Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            How Pacto Works (in 3 Steps)
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {howItWorks.map((step, index) => (
            <Card key={index} className="feature-card relative">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-emerald rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-emerald-glow">
                  {step.step}
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-2">
            🔗 Escrow logic is fully programmable, trustless, and on-chain —
            powered by{" "}
            <span className="font-semibold text-emerald-400">
              Trustless Work
            </span>
            .
          </p>
        </div>
      </section>

      {/* Supported Assets & Countries */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Supported Assets & Countries
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid gap-6">
              {supportedAssets.map((asset) => (
                <Card key={asset.symbol} className="feature-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <TokenIcon token={asset.symbol} size="lg" />
                        <div>
                          <h3 className="font-bold text-xl text-foreground">
                            {asset.symbol}
                          </h3>
                          <p className="text-muted-foreground">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">
                              Region
                            </p>
                            <p className="font-semibold text-foreground">
                              {asset.region}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">
                              Payment Methods
                            </p>
                            <p className="font-semibold text-foreground">
                              {asset.paymentMethods}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Builders & Issuers */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-emerald-dark border-glass-border">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              For Builders & Issuers
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Want to add your own stablecoin or corridor?
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-emerald rounded-xl flex items-center justify-center mx-auto mb-3 shadow-emerald-glow">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-muted-foreground">
                  Plug in your token via a simple config
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-emerald rounded-xl flex items-center justify-center mx-auto mb-3 shadow-emerald-glow">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-muted-foreground">
                  Use our escrow engine (Trustless Work)
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-emerald rounded-xl flex items-center justify-center mx-auto mb-3 shadow-emerald-glow">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-muted-foreground">
                  Add your fiat payment method of choice
                </p>
              </div>
            </div>
            <Button className="btn-primary text-lg px-8 py-3">
              👉 Join the Pacto Experience
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Built With */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Built With
          </h2>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6 justify-items-center">
          {techStack.map((tech, index) => (
            <Card key={index} className="feature-card">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {tech.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {tech.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the decentralized P2P revolution and start trading stablecoins
            with complete trust and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="btn-secondary text-lg px-8 py-4"
              >
                📖 Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent text-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
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
                  Decentralized P2P OTC for Stellar stablecoins — built for
                  LATAM. Open to the world.
                </p>
              </div>
            </div>
            <div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div>
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
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
          </div>
          <div className="border-t border-glass-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Pacto. Built for the decentralized future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
