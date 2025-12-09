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
  Wallet,
  LogOut,
  LogIn,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Listings', href: '/dashboard/listings', icon: List },
  { name: 'Orders', href: '/dashboard/escrows', icon: Shield },
  { name: 'Merchants', href: '/dashboard/merchants', icon: Users },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { handleDisconnect, handleConnect } = useWallet();
  const { address, network, walletType, isConnected } =
    useGlobalAuthenticationStore();
  const { user, signOut } = useAuth();
  const canSeeAdmin = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

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

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="glass-effect shadow-glass group-data-[side=left]:border-r group-data-[side=right]:border-l border-white/20 [&_[data-sidebar=sidebar]]:bg-emerald-pattern [&_[data-sidebar=sidebar]]:bg-cover [&_[data-sidebar=sidebar]]:bg-center"
    >
      <SidebarHeader className="p-6 border-b border-glass-border glass-effect group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="w-20 h-10 rounded-xl flex items-center justify-center logo-glow overflow-hidden group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
            <Image
              src="/logo.webp"
              alt="Pacto Logo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    size="lg"
                    tooltip={item.name}
                    className={cn(
                      'nav-card text-foreground/70 hover:text-foreground hover:bg-glass-hover group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:rounded-xl',
                      pathname === item.href &&
                        'bg-gradient-emerald text-white shadow-emerald-glow'
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full"
                      aria-label={`Go to ${item.name}`}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      <item.icon className="w-5 h-5 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {canSeeAdmin && (
                <SidebarMenuItem key="Admin">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/dashboard/admin'}
                    size="lg"
                    tooltip="Admin"
                    className={cn(
                      'nav-card text-foreground/70 hover:text-foreground hover:bg-glass-hover group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:rounded-xl',
                      pathname === '/dashboard/admin' &&
                        'bg-gradient-emerald text-white shadow-emerald-glow'
                    )}
                  >
                    <Link
                      href="/dashboard/admin"
                      className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full"
                      aria-label="Go to Admin"
                      aria-current={
                        pathname === '/dashboard/admin' ? 'page' : undefined
                      }
                    >
                      <Settings className="w-5 h-5 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Admin
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

      <SidebarFooter className="p-4 sm:p-6 group-data-[collapsible=icon]:p-2 space-y-3">
        {/* User Profile Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 p-3 nav-card rounded-xl group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
              {/* User Avatar */}
              <div className="relative flex-shrink-0">
                {user?.avatar_url ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                    <Image
                      src={user.avatar_url}
                      alt={getUserDisplayName()}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border-2 border-emerald-500/30 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                    <span className="text-white font-semibold text-sm sm:text-base group-data-[collapsible=icon]:text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                {isConnected && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-background group-data-[collapsible=icon]:w-2.5 group-data-[collapsible=icon]:h-2.5">
                    <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                    {getUserDisplayName()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected && address ? (
                    <>
                      <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Not connected
                    </p>
                  )}
                </div>
                {walletType && isConnected && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                    {walletType} • {network}
                  </p>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            hidden={!isCollapsed}
            className="text-accent"
          >
            <div className="text-xs space-y-1">
              <p className="font-semibold">{getUserDisplayName()}</p>
              {isConnected && address && (
                <p className="font-mono">{address.slice(0, 8)}...{address.slice(-6)}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:gap-1">
          {isConnected ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'justify-start glass-effect-light hover:bg-glass-hover text-foreground/80 w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center text-xs sm:text-sm'
                    )}
                    onClick={handleDisconnect}
                    aria-label="Disconnect wallet"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2 group-data-[collapsible=icon]:hidden">
                      Disconnect Wallet
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  hidden={!isCollapsed}
                  className="text-accent"
                >
                  Disconnect Wallet
                </TooltipContent>
              </Tooltip>
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'justify-start glass-effect-light hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 text-foreground/80 w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center text-xs sm:text-sm'
                      )}
                      onClick={handleSignOut}
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="ml-2 group-data-[collapsible=icon]:hidden">
                        Sign Out
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    hidden={!isCollapsed}
                    className="text-accent"
                  >
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'justify-start glass-effect-light hover:bg-glass-hover text-foreground/80 w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center text-xs sm:text-sm btn-emerald-outline'
                  )}
                  onClick={handleConnect}
                  aria-label="Connect wallet"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="ml-2 group-data-[collapsible=icon]:hidden">
                    Connect Wallet
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                hidden={!isCollapsed}
                className="text-accent"
              >
                Connect Wallet
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
