'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  List,
  Users,
  Shield,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useCrossmint } from '@/hooks/use-crossmint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Listings', href: '/dashboard/listings', icon: List },
  { name: 'Orders', href: '/dashboard/escrows', icon: Shield },
  { name: 'Merchants', href: '/dashboard/merchants', icon: Users },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { logout: handleDisconnect } = useCrossmint();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-69 glass-effect backdrop-blur-md">
      <div className="container mx-auto pl-6 pr-3 md:pr-6 py-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-20 h-10 rounded-xl flex items-center justify-center logo-glow overflow-hidden">
                <Link href="/">
                  <Image
                    src="/logo.webp"
                    alt="Pacto Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex justify-center">
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'text-foreground/70 hover:text-foreground hover:bg-glass-hover',
                    pathname === item.href &&
                      'bg-gradient-emerald text-white shadow-emerald-glow'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Profile */}
          <div className="flex items-center justify-end gap-3 justify-self-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  type="button"
                  className="shrink-0 focus:outline-none"
                >
                  <Image
                    src={user?.avatar_url || '/mock-photo.jpg'}
                    alt={user?.full_name ? `${user.full_name} avatar` : 'User avatar'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full ring-1 ring-white/30 object-cover"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="min-w-[12rem] rounded-xl -mx-14 glass-effect-light border border-white/30 shadow-md">
                <DropdownMenuItem asChild className="hover:bg-glass-hover rounded-lg">
                  <Link href="/dashboard/profile" aria-label="Go to profile">
                    <User className="w-4 h-4" />
                    <span className="ml-2">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="!bg-white/30" />
                <DropdownMenuItem
                  className="hover:bg-glass-hover rounded-lg"
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleDisconnect();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden glass-effect-light hover:bg-glass-hover"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-glass-border">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    'text-foreground/70 hover:text-foreground hover:bg-glass-hover',
                    pathname === item.href &&
                      'bg-gradient-emerald text-white shadow-emerald-glow'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Wallet Info removed */}
          </div>
        )}
      </div>
    </header>
  );
}
