'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getPoolsWithFallback } from '@/lib/api';
import { Pool, PoolCategory } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import { 
  Filter, 
  Menu, 
  Shield,
  Lock
} from 'lucide-react';
import { PoolCard } from '@/components/PoolCard';
import { PoolsTable } from '@/components/PoolsTable';
import { WalletConnectionDialog } from '@/components/WalletConnectionDialog';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { walletConnection } = useAuth();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setIsLoading(true);
        const fetchedPools = await getPoolsWithFallback();
        setPools(fetchedPools);
        setFilteredPools(fetchedPools);
        setError(null);
      } catch (err) {
        setError('Failed to fetch pools');
        console.error('Error fetching pools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPools(pools);
    } else {
      setFilteredPools(pools.filter(pool => pool.category === selectedCategory));
    }
  }, [selectedCategory, pools]);

  const getCategoryStats = (category: PoolCategory) => {
    const categoryPools = pools.filter(pool => pool.category === category);
    const totalTVL = categoryPools.reduce((sum, pool) => sum + pool.tvlUsd, 0);
    const avgAPY = categoryPools.length > 0 
      ? categoryPools.reduce((sum, pool) => sum + pool.apy, 0) / categoryPools.length 
      : 0;
    
    return { count: categoryPools.length, totalTVL, avgAPY };
  };

  const isYieldAggregatorUnlocked = walletConnection.isConnected;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
        <div className="lg:ml-64">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pools...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
        <div className="lg:ml-64">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Shield className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Pools</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">DeFi Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor your favorite DeFi pools</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <WalletConnectionDialog />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="container mx-auto p-6 space-y-8">
          {/* Category Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Lending', 'Liquid Staking', 'Yield Aggregator'] as PoolCategory[]).map((category) => {
              const stats = getCategoryStats(category);
              const isLocked = category === 'Yield Aggregator' && !isYieldAggregatorUnlocked;
              
              return (
                <Card key={category} className={`relative overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="bg-card border rounded-lg p-4 text-center shadow-lg">
                        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">Connect Wallet to Unlock</p>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <Badge variant="secondary" className={getCategoryColor(category)}>
                        {stats.count} pools
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total TVL</span>
                        <span className="font-semibold">${(stats.totalTVL / 1e6).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg APY</span>
                        <span className="font-semibold">{stats.avgAPY.toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Lending">Lending</SelectItem>
                    <SelectItem value="Liquid Staking">Liquid Staking</SelectItem>
                    <SelectItem value="Yield Aggregator">Yield Aggregator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>

          {/* Pools Display */}
          {filteredPools.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pools found for the selected category</p>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPools.map((pool) => (
                <PoolCard 
                  key={pool.id} 
                  pool={pool} 
                />
              ))}
            </div>
          ) : (
            <PoolsTable 
              pools={filteredPools} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
