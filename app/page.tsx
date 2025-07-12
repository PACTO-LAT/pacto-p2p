"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Globe, Lock, DollarSign, Rocket } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { TokenIcon } from "@/components/token-icon"

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
      description: "You choose the price. Compete with other traders in a non-custodial environment.",
    },
    {
      icon: Rocket,
      title: "Borderless & Stable",
      description:
        "Move value across borders and convert to local fiat on demand. Ideal for freelancers, merchants, and crypto-native LATAM users.",
    },
  ]

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
      description: "Once both sides approve, the smart contract automatically releases the funds.",
    },
  ]

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
      color: "bg-primary",
    },
  ]

  const techStack = [
    { name: "Next.js", description: "High-performance frontend" },
    { name: "Trustless Work", description: "Escrow logic on Stellar" },
    { name: "Supabase", description: "Backend for users, listings, and storage" },
    { name: "TanStack", description: "State and async data handling" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Pacto</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">P2P OTC for Stellar Stablecoins</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/listings"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Marketplace
            </Link>
            <Link
              href="/escrows"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Escrows
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="outline" className="bg-transparent border-gray-300 dark:border-gray-600">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary-600">
                🔐 Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-gray-900 dark:text-white">
            Trade Stablecoins for Local Fiat — With <span className="text-primary">Pacto</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
            A decentralized OTC platform for Stellar stablecoins like{" "}
            <span className="text-primary font-semibold">CRCX, MXNX, and USDC</span>.
          </p>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Buy and sell directly with peers in your country. No middlemen. No custodians.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary-600 text-lg px-8 py-3">
                🔐 Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="bg-transparent border-gray-300 dark:border-gray-600 text-lg px-8 py-3">
              📖 How Pacto Works
            </Button>
          </div>

          <Badge className="bg-primary-50 dark:bg-primary-900/20 text-primary border-primary-200 dark:border-primary-800 text-base px-6 py-2">
            💸 Why Use Pacto?
          </Badge>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            🔧 How Pacto Works (in 3 Steps)
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {howItWorks.map((step, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 relative"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  {step.step}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            🔗 Escrow logic is fully programmable, trustless, and on-chain — powered by{" "}
            <span className="font-semibold text-primary">Trustless Work</span>.
          </p>
        </div>
      </section>

      {/* Supported Assets & Countries */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">🔗 Supported Assets & Countries</h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid gap-6">
              {supportedAssets.map((asset) => (
                <Card
                  key={asset.symbol}
                  className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-0"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <TokenIcon token={asset.symbol} size="lg" />
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white">{asset.symbol}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Region</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{asset.region}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Payment Methods</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{asset.paymentMethods}</p>
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
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">👨‍💻 For Builders & Issuers</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Want to add your own stablecoin or corridor?
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Plug in your token via a simple config</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Use our escrow engine (Trustless Work)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Add your fiat payment method of choice</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary-600 text-lg px-8 py-3">
              👉 Join the Pacto Developer Beta
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Built With */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">🛠️ Built With</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow border-0"
            >
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{tech.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the decentralized P2P revolution and start trading stablecoins with complete trust and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-white hover:bg-primary-600 text-lg px-8 py-4">
                🔐 Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent text-lg px-8 py-4"
              >
                📖 Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent text-gray-900 dark:text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">Pacto</span>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Decentralized P2P OTC for Stellar stablecoins — built for LATAM. Open to the world.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-6 text-lg text-gray-900 dark:text-white">Platform</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/listings" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/escrows" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Escrows
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg text-gray-900 dark:text-white">Resources</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://twitter.com"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 Pacto. Built for the decentralized future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
