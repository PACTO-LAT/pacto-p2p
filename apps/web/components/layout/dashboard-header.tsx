'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  List,
  Users,
  Shield,
  User,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { toast } from 'sonner';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Listings', href: '/dashboard/listings', icon: List },
  { name: 'Orders', href: '/dashboard/escrows', icon: Shield },
  { name: 'Merchants', href: '/dashboard/merchants', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
] as const;

export function DashboardHeader() {
  const pathname = usePathname();
  const { handleDisconnect, handleConnect } = useWallet();
  const { address, network, walletType, isConnected } =
    useGlobalAuthenticationStore();
  const { user, signOut } = useAuth();
  const canSeeAdmin = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    if (address) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return 'Guest';
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name.includes('...')) return name.slice(0, 2).toUpperCase();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle sign out with wallet disconnection
  const handleSignOut = async () => {
    try {
      // Disconnect wallet if connected
      if (isConnected) {
        try {
          await handleDisconnect();
        } catch (error) {
          console.error('Error disconnecting wallet:', error);
          // Continue with sign out even if wallet disconnect fails
        }
      }
      // Sign out from auth
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const NavLink = ({
    item,
    onClick,
  }: {
    item: (typeof navigation)[number];
    onClick?: () => void;
  }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-glass-hover text-foreground/70 hover:text-foreground',
        pathname === item.href &&
          'bg-gradient-emerald text-white shadow-emerald-glow'
      )}
      aria-current={pathname === item.href ? 'page' : undefined}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full glass-effect backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-20 h-10 rounded-xl flex items-center justify-center logo-glow overflow-hidden">
              <Image
                src="/logo.webp"
                alt="Pacto Logo"
                width={80}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
            {canSeeAdmin && (
              <Link
                href="/dashboard/admin"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-glass-hover text-foreground/70 hover:text-foreground',
                  pathname === '/dashboard/admin' &&
                    'bg-gradient-emerald text-white shadow-emerald-glow'
                )}
                aria-current={
                  pathname === '/dashboard/admin' ? 'page' : undefined
                }
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Side: User Menu & Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <AnimatedThemeToggler
              className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-glass-hover transition-colors"
              duration={400}
            />

            {/* Wallet Status Indicator (Desktop) */}
            {isConnected && address && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-glass-hover"
                >
                  {user?.avatar_url ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/30">
                      <Image
                        src={user.avatar_url}
                        alt={getUserDisplayName()}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                      {isConnected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background">
                          <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-2 border-emerald-500/30">
                      <span className="text-white font-semibold text-sm">
                        {getUserInitials()}
                      </span>
                      {isConnected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background">
                          <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-effect">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{getUserDisplayName()}</p>
                    {isConnected && address && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {address.slice(0, 8)}...{address.slice(-6)}
                      </p>
                    )}
                    {walletType && isConnected && (
                      <p className="text-xs text-muted-foreground">
                        {walletType} • {network}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isConnected ? (
                  <>
                    <DropdownMenuItem
                      onClick={handleDisconnect}
                      className="cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                    {user && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleConnect}
                    className="cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-effect w-[280px]">
                <div className="flex flex-col gap-4 mt-6">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-3 nav-card rounded-xl">
                    {user?.avatar_url ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30">
                        <Image
                          src={user.avatar_url}
                          alt={getUserDisplayName()}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                        {isConnected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background">
                            <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-2 border-emerald-500/30">
                        <span className="text-white font-semibold">
                          {getUserInitials()}
                        </span>
                        {isConnected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background">
                            <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {getUserDisplayName()}
                      </p>
                      {isConnected && address ? (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Not connected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        item={item}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    ))}
                    {canSeeAdmin && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          'hover:bg-glass-hover text-foreground/70 hover:text-foreground',
                          pathname === '/dashboard/admin' &&
                            'bg-gradient-emerald text-white shadow-emerald-glow'
                        )}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-glass-border">
                    {/* Theme Toggle (Mobile) */}
                    <div className="flex items-center justify-between p-2 rounded-lg glass-effect-light">
                      <span className="text-sm text-foreground/70">Theme</span>
                      <AnimatedThemeToggler
                        className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-glass-hover transition-colors"
                        duration={400}
                      />
                    </div>

                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start glass-effect-light hover:bg-glass-hover"
                          onClick={() => {
                            handleDisconnect();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Disconnect Wallet
                        </Button>
                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start glass-effect-light hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                            onClick={() => {
                              handleSignOut();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start glass-effect-light hover:bg-glass-hover btn-emerald-outline"
                        onClick={() => {
                          handleConnect();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

