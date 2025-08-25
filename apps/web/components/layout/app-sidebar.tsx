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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import useGlobalAuthenticationStore from '@/store/wallet.store';

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
  const canSeeAdmin = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;

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
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
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
                      <span className="group-data-[collapsible=icon]:hidden">Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

      <SidebarFooter className="p-6 group-data-[collapsible=icon]:p-2">
        <div className="space-y-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 p-3 nav-card rounded-xl group-data-[collapsible=icon]:hidden">
                <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : 'Not Connected'}
                    </p>
                    {isConnected && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full glow-emerald group-data-[collapsible=icon]:hidden"></div>
                    )}
                  </div>
                  {walletType && (
                    <p className="text-xs text-muted-foreground">
                      {walletType} • {network}
                    </p>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={!isCollapsed} className="text-accent">
              <span className="text-xs">
                {isConnected
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Not Connected'}
              </span>
            </TooltipContent>
          </Tooltip>
          {isConnected ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start glass-effect-light hover:bg-glass-hover text-foreground/80 w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'
                  )}
                  onClick={handleDisconnect}
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2 group-data-[collapsible=icon]:hidden">Disconnect</span>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start glass-effect-light hover:bg-glass-hover text-foreground/80 w-full group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'
                  )}
                  onClick={handleConnect}
                  aria-label="Connect wallet"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="ml-2 group-data-[collapsible=icon]:hidden">Connect Wallet</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" hidden={!isCollapsed} className="text-accent">
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
