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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useGlobalAuthenticationStore from "@/store/wallet.store";

export default function AuthPage() {
  const { handleConnect } = useWallet();
  const { address } = useGlobalAuthenticationStore();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push("/dashboard");
    }
  }, [address, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <Card className="bg-white dark:bg-gray-900 shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
              Connect your Stellar wallet to start trading stablecoins securely
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button className="w-full" onClick={handleConnect}>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 mr-3" />
                Connect Wallet
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
