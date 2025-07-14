"use client";

import {
  Home,
  List,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import useGlobalAuthenticationStore from "@/store/wallet.store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { address, network, walletType, isConnected } =
    useGlobalAuthenticationStore();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Marketplace", href: "/dashboard/listings", icon: List },
    { name: "Orders", href: "/dashboard/escrows", icon: Shield },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Admin", href: "/dashboard/admin", icon: Settings },
  ];

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-emerald text-white shadow-emerald-glow"
                : "text-foreground/70 hover:text-foreground hover:bg-glass-hover nav-card"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
  const { handleDisconnect } = useWallet();

  return (
    <div className="min-h-screen bg-background bg-pattern">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="lg:hidden">
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-4 left-4 z-50 glass-effect hover:bg-glass-hover"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent
          side="left"
          className="w-72 p-0 glass-effect border-r border-glass-border"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-glass-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-emerald rounded-xl flex items-center justify-center logo-glow">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  Pacto
                </span>
              </div>
            </div>
            <nav className="flex-1 p-6 space-y-2">
              <NavItems />
            </nav>
            <div className="p-6 border-t border-glass-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Tema
                </span>
                {/* <ThemeToggle /> */}
              </div>
              <Button
                variant="outline"
                className="w-full justify-start glass-effect-light hover:bg-glass-hover text-foreground/80"
                onClick={handleDisconnect}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow glass-effect shadow-glass border-r border-glass-border">
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-emerald rounded-xl flex items-center justify-center logo-glow">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Pacto</span>
            </div>
          </div>
          <nav className="flex-1 p-6 space-y-2">
            <NavItems />
          </nav>
          <div className="p-6 border-t border-glass-border">
            <div className="flex items-center gap-3 p-4 nav-card rounded-xl mb-4">
              <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Not Connected"}
                  </p>
                  {isConnected && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full glow-emerald"></div>
                  )}
                </div>
                {walletType && (
                  <p className="text-xs text-muted-foreground">
                    {walletType} • {network}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Tema
              </span>
              {/* <ThemeToggle /> */}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start glass-effect-light hover:bg-glass-hover text-foreground/80"
              onClick={handleDisconnect}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 glass-effect backdrop-blur-md border-b border-glass-border lg:hidden">
          <div className="flex items-center justify-between px-16 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-emerald rounded-lg flex items-center justify-center logo-glow">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-foreground">Pacto</span>
            </div>
            {/* <ThemeToggle /> */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8 bg-background min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
