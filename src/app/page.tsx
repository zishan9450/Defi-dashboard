'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WalletConnectionDialog } from '@/components/WalletConnectionDialog';
import { Sidebar } from '@/components/Sidebar';
import { PoolCard } from '@/components/PoolCard';
import { PoolsTable } from '@/components/PoolsTable';
import { useAuth } from '@/contexts/AuthContext';
import { getPoolsWithFallback } from '@/lib/api';
import { Pool } from '@/types';
import { Lock, Unlock, BarChart3, DollarSign, Activity, Menu } from 'lucide-react';

export default function DashboardPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isYieldAggregatorUnlocked } = useAuth();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const fetchedPools = await getPoolsWithFallback();
        console.log('5. Dashboard received pools:', fetchedPools.length);
        setPools(fetchedPools);
        setError(null);
      } catch (err) {
        console.error('Error fetching pools:', err);
        setError('Failed to fetch pools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  const filteredPools = selectedCategory === 'all' 
    ? pools 
    : pools.filter(pool => pool.category === selectedCategory);

  const categoryStats = [
    {
      category: 'Lending',
      total: pools.filter(p => p.category === 'Lending').length,
      totalTVL: pools.filter(p => p.category === 'Lending').reduce((sum, p) => sum + p.tvlUsd, 0),
      avgAPY: pools.filter(p => p.category === 'Lending').reduce((sum, p) => sum + (p.apy || 0), 0) / Math.max(pools.filter(p => p.category === 'Lending').length, 1),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      category: 'Liquid Staking',
      total: pools.filter(p => p.category === 'Liquid Staking').length,
      totalTVL: pools.filter(p => p.category === 'Liquid Staking').reduce((sum, p) => sum + p.tvlUsd, 0),
      avgAPY: pools.filter(p => p.category === 'Liquid Staking').reduce((sum, p) => sum + (p.apy || 0), 0) / Math.max(pools.filter(p => p.category === 'Liquid Staking').length, 1),
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      category: 'Yield Aggregator',
      total: pools.filter(p => p.category === 'Yield Aggregator').length,
      totalTVL: pools.filter(p => p.category === 'Yield Aggregator').reduce((sum, p) => sum + p.tvlUsd, 0),
      avgAPY: pools.filter(p => p.category === 'Yield Aggregator').reduce((sum, p) => sum + (p.apy || 0), 0) / Math.max(pools.filter(p => p.category === 'Yield Aggregator').length, 1),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading DeFi pools...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-destructive text-lg mb-4">⚠️ Error</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileSidebarOpen(true);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="block"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">DeFi Dashboard</h1>
                <p className="text-muted-foreground text-sm">Monitor your favorite DeFi pools</p>
              </div>
            </div>
            <WalletConnectionDialog />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Category Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {categoryStats.map((stats) => {
                const IconComponent = stats.icon;
                return (
                  <Card key={`${stats.category}-${stats.total}`} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${stats.bgColor}`}>
                          <IconComponent className={`h-6 w-6 ${stats.color}`} />
                        </div>
                        {stats.category === 'Yield Aggregator' && !isYieldAggregatorUnlocked && (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        {stats.category === 'Yield Aggregator' && isYieldAggregatorUnlocked && (
                          <Unlock className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <CardTitle className="text-lg text-card-foreground mt-4">{stats.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xl font-bold text-card-foreground">{stats.total}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pools</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-card-foreground">${(stats.totalTVL / 1e9).toFixed(2)}B</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">TVL</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-card-foreground">{stats.avgAPY.toFixed(2)}%</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg APY</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filters and View Toggle */}
            <div className="bg-card/50 rounded-xl p-6 mb-8 border shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Lending">Lending</SelectItem>
                      <SelectItem value="Liquid Staking">Liquid Staking</SelectItem>
                      <SelectItem value="Yield Aggregator">Yield Aggregator</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </div>
                </div>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="rounded-r-none px-6"
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none px-6"
                  >
                    Table
                  </Button>
                </div>
              </div>
            </div>

            {/* Pools Display */}
            <div className="space-y-6">
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} />
                  ))}
                </div>
              ) : (
                <PoolsTable pools={filteredPools} />
              )}
            </div>

            {filteredPools.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No pools found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
