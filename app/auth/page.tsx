"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";

export default function AuthPage() {
  const { handleConnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    if (isConnecting) return; // Prevent multiple clicks
    
    setIsConnecting(true);
    try {
      await handleConnect();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-pattern flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-emerald-100/30 dark:from-emerald-950/50 dark:via-transparent dark:to-emerald-900/30"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <Card className="glass-card animate-fade-in">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-emerald-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center glow-emerald-strong animate-float">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-hero-gradient mb-2">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Connect your Stellar wallet to start trading stablecoins securely
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              className="w-full btn-emerald" 
              onClick={handleWalletConnect}
              disabled={isConnecting}
            >
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-3" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
