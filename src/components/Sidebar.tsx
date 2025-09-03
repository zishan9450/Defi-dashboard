'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Wallet, 
  Filter,
  Home,
  TrendingUp,
  Shield,
  Zap,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { walletConnection } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      active: pathname === '/'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      active: pathname === '/analytics'
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings'
    }
  ];

  const categoryFilters = [
    { name: 'Lending', icon: Shield, color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
    { name: 'Liquid Staking', icon: Zap, color: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' },
    { name: 'Yield Aggregator', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20' }
  ];

  const handleNavigation = (href: string) => {
    if (href === '/analytics' || href === '/settings') {
      // For now, just show a placeholder - you can implement these pages later
      alert(`${href} page coming soon!`);
      return;
    }
    
    // Close mobile sidebar after navigation
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
    
    router.push(href);
  };

  // Mobile overlay
  if (isMobile && isMobileOpen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onMobileClose}
        />
        
        {/* Mobile Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-background border-r shadow-2xl z-[60] animate-in slide-in-from-left duration-300">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg text-foreground">DeFi</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 space-y-2">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.title}
                      variant={item.active ? "default" : "ghost"}
                      className="w-full justify-start gap-3 px-3"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Category Filters */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Categories</span>
                </div>
                <div className="space-y-2">
                  {categoryFilters.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.name}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 px-2 ${category.color}`}
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="text-xs">{category.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-3">
              {/* Wallet Status */}
              <div className="flex items-center gap-2">
                <Wallet className={`h-4 w-4 ${walletConnection.isConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">
                    {walletConnection.isConnected ? 'Connected' : 'Not Connected'}
                  </div>
                  {walletConnection.isConnected && (
                    <div className="text-xs font-medium text-foreground truncate">
                      {walletConnection.address?.slice(0, 6)}...{walletConnection.address?.slice(-4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar - always visible on large screens
  return (
    <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-background border-r shadow-2xl z-[60]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">DeFi</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.title}
                  variant={item.active ? "default" : "ghost"}
                  className="w-full justify-start gap-3 px-3"
                  onClick={() => handleNavigation(item.href)}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              );
            })}
          </div>

          {/* Category Filters */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Categories</span>
            </div>
            <div className="space-y-2">
              {categoryFilters.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.name}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start gap-2 h-8 px-2 ${category.color}`}
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="text-xs">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-3">
          {/* Wallet Status */}
          <div className="flex items-center gap-2">
            <Wallet className={`h-4 w-4 ${walletConnection.isConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">
                {walletConnection.isConnected ? 'Connected' : 'Not Connected'}
              </div>
              {walletConnection.isConnected && (
                <div className="text-xs font-medium text-foreground truncate">
                  {walletConnection.address?.slice(0, 6)}...{walletConnection.address?.slice(-4)}
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
