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
  ChevronDown,
  Copy,
  Unplug,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
import { sileo } from 'sileo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Listings', href: '/dashboard/listings', icon: List },
  { name: 'Orders', href: '/dashboard/orders', icon: Shield },
  { name: 'Merchants', href: '/dashboard/merchants', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
] as const;

export function DashboardHeader() {
  const pathname = usePathname();
  const { handleDisconnect, handleConnect } = useWallet();
  const { address, isConnected } = useGlobalAuthenticationStore();
  const { user, signOut, updateProfile, loading: authLoading } = useAuth();
  const canSeeAdmin = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync stellar_address when wallet is already connected on page load
  useEffect(() => {
    if (user && address && user.stellar_address !== address) {
      updateProfile({ stellar_address: address }).catch(() => {
        // Ignore - user may have connected from another tab
      });
    }
  }, [user, address, updateProfile]);

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
      sileo.success({ title: 'Signed out successfully' });
    } catch (error) {
      console.error('Error signing out:', error);
      sileo.error({ title: 'Failed to sign out. Please try again.' });
    }
  };

  // Handle wallet connection with error handling + save stellar_address to DB
  const handleWalletConnect = async () => {
    try {
      const connectedAddress = await handleConnect();
      if (connectedAddress) {
        if (user) {
          await updateProfile({ stellar_address: connectedAddress });
        }
        sileo.success({ title: 'Wallet connected successfully' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect wallet';
      sileo.error({ title: errorMessage });
      console.error('Error connecting wallet:', error);
    }
  };

  // Handle wallet disconnection with error handling
  const handleWalletDisconnect = async () => {
    try {
      await handleDisconnect();
      sileo.success({ title: 'Wallet disconnected successfully' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to disconnect wallet';
      sileo.error({ title: errorMessage });
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Mobile-specific handlers that close menu after action
  const handleMobileConnect = async () => {
    try {
      const connectedAddress = await handleConnect();
      if (connectedAddress) {
        if (user) {
          await updateProfile({ stellar_address: connectedAddress });
        }
        sileo.success({ title: 'Wallet connected successfully' });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect wallet';
      sileo.error({ title: errorMessage });
      console.error('Error connecting wallet:', error);
    } finally {
      setMobileMenuOpen(false);
    }
  };

  const handleMobileDisconnect = async () => {
    try {
      await handleDisconnect();
      sileo.success({ title: 'Wallet disconnected successfully' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to disconnect wallet';
      sileo.error({ title: errorMessage });
      console.error('Error disconnecting wallet:', error);
    } finally {
      setMobileMenuOpen(false);
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
            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-glass-hover"
                >
                  {authLoading ? (
                    <div className="relative w-10 h-10 rounded-full bg-muted/50 border-2 border-emerald-500/20 flex items-center justify-center animate-pulse" />
                  ) : user?.avatar_url ? (
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
                    <p className="text-sm font-semibold">
                      {getUserDisplayName()}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user && (
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Connect Wallet Button (Desktop) - Positioned AFTER user avatar */}
            <div className="hidden md:block">
              {isConnected && address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Wallet options for ${address.slice(0, 6)}...${address.slice(-4)}`}
                      className="relative glass-effect border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group"
                    >
                      <span className="text-xs font-mono text-emerald-400 group-hover:text-emerald-300">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                      <ChevronDown className="w-3 h-3 ml-1.5 text-emerald-400/70 group-hover:text-emerald-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 glass-effect"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          Connected wallet
                        </p>
                        <p className="text-xs font-mono text-emerald-400 truncate">
                          {address}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        sileo.success({ title: 'Address copied to clipboard' });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleWalletDisconnect}
                      className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                      <Unplug className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={handleWalletConnect}
                  aria-label="Connect wallet"
                  className="bg-gradient-emerald hover:shadow-emerald-glow transition-all duration-300 text-white font-medium"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

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
                    {authLoading ? (
                      <div className="w-12 h-12 rounded-full bg-muted/50 border-2 border-emerald-500/20 flex items-center justify-center animate-pulse" />
                    ) : user?.avatar_url ? (
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
                    {/* Connect Wallet Button (Mobile) */}
                    {isConnected && address ? (
                      <Button
                        variant="outline"
                        size="default"
                        onClick={handleMobileDisconnect}
                        aria-label={`Disconnect wallet ${address.slice(0, 6)}...${address.slice(-4)}`}
                        title="Disconnect wallet"
                        className="w-full relative glass-effect border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group justify-start"
                      >
                        <span className="text-sm font-mono text-emerald-400 group-hover:text-emerald-300 ml-4">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        onClick={handleMobileConnect}
                        aria-label="Connect wallet"
                        className="w-full bg-gradient-emerald hover:shadow-emerald-glow transition-all duration-300 text-white font-medium justify-start"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}

                    {/* Theme Toggle (Mobile) */}
                    <div className="flex items-center justify-between p-2 rounded-lg glass-effect-light">
                      <span className="text-sm text-foreground/70">Theme</span>
                    </div>

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
