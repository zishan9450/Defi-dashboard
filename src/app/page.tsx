'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PoolCard } from '@/components/PoolCard';
import { PoolsTable } from '@/components/PoolsTable';
import { WalletConnectionDialog } from '@/components/WalletConnectionDialog';
import { Pool, PoolCategory } from '@/types';
import { getPoolsWithFallback } from '@/lib/api';
import { Grid, Table as TableIcon, Filter, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { isYieldAggregatorUnlocked } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PoolCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Fetch pools on component mount
  useEffect(() => {
    const loadPools = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo('Starting to fetch pools...');
        
        // Use the new fallback function that tries multiple approaches
        const poolsData = await getPoolsWithFallback();
        setDebugInfo(`Successfully loaded ${poolsData.length} pools`);
        
        setPools(poolsData);
        setFilteredPools(poolsData);
        
      } catch (err) {
        console.error('Error loading pools:', err);
        setError('Failed to load pools. Please try again later.');
        setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPools();
  }, []);

  // Filter pools based on selected category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPools(pools);
    } else {
      const filtered = pools.filter(pool => 
        pool.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredPools(filtered);
    }
  }, [pools, selectedCategory]);

  const handlePoolClick = (pool: Pool) => {
    router.push(`/pool/${pool.id}`);
  };

  const getCategoryStats = (category: PoolCategory) => {
    const categoryPools = pools.filter(pool => 
      pool.category.toLowerCase() === category.toLowerCase()
    );
    const lockedPools = category === 'Yield Aggregator' && !isYieldAggregatorUnlocked 
      ? categoryPools.length 
      : 0;
    
    return {
      total: categoryPools.length,
      locked: lockedPools,
      unlocked: categoryPools.length - lockedPools
    };
  };

  const categoryStats = {
    Lending: getCategoryStats('Lending'),
    'Liquid Staking': getCategoryStats('Liquid Staking'),
    'Yield Aggregator': getCategoryStats('Yield Aggregator'),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DeFi pools...</p>
          {debugInfo && (
            <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Debug Info:</p>
              <p className="text-sm text-gray-600">{debugInfo}</p>
            </div>
          )}
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                DeFi Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Explore {pools.length} DeFi pools across different categories
              </p>
            </div>
            
            {/* Wallet Connection */}
            <WalletConnectionDialog>
              <Button 
                variant={isYieldAggregatorUnlocked ? "outline" : "default"}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isYieldAggregatorUnlocked 
                    ? 'border-green-200 text-green-700 hover:bg-green-50' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isYieldAggregatorUnlocked ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Unlocked
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </WalletConnectionDialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const isLocked = category === 'Yield Aggregator' && !isYieldAggregatorUnlocked;
            return (
              <div key={`${category}-${stats.total}`} className="group">
                <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 ${
                  isLocked ? 'ring-2 ring-orange-200/50' : 'hover:scale-[1.02]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">{category}</h3>
                    <div className={`w-3 h-3 rounded-full ${
                      isLocked ? 'bg-orange-400' : 'bg-green-400'
                    }`} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Total Pools</span>
                      <span className="font-semibold text-slate-900">{stats.total}</span>
                    </div>
                    {isLocked && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span className="text-sm">Locked</span>
                        <span className="font-semibold">{stats.locked}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Available</span>
                      <span className="font-semibold">{stats.unlocked}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Filter className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Filter by:</span>
              </div>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PoolCategory | 'All')}>
                <SelectTrigger className="w-[200px] border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Lending">Lending</SelectItem>
                  <SelectItem value="Liquid Staking">Liquid Staking</SelectItem>
                  <SelectItem value="Yield Aggregator">Yield Aggregator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">View:</span>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="cards" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Grid className="h-4 w-4" />
                    Cards
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <TableIcon className="h-4 w-4" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600 text-sm">
            Showing {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Pools Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                isLocked={pool.category.toLowerCase() === 'yield aggregator' && !isYieldAggregatorUnlocked}
                onClick={() => handlePoolClick(pool)}
              />
            ))}
          </div>
        ) : (
          <PoolsTable
            pools={filteredPools}
            isYieldAggregatorUnlocked={isYieldAggregatorUnlocked}
            onPoolClick={handlePoolClick}
          />
        )}

        {/* Empty State */}
        {filteredPools.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No pools found</h3>
            <p className="text-slate-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
