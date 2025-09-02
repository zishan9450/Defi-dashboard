'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APYChart } from '@/components/APYChart';
import { Pool, HistoricalAPY } from '@/types';
import { fetchTargetPools, fetchHistoricalAPY, getMonthlyAPYData, formatTVL, formatAPY } from '@/lib/api';
import { ArrowLeft, TrendingUp, DollarSign, Activity, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PoolDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [pool, setPool] = useState<Pool | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalAPY[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoolData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all pools and find the specific pool
        const allPools = await fetchTargetPools();
        const foundPool = allPools.find(p => p.id === id);

        if (!foundPool) {
          setError('Pool not found');
          return;
        }

        setPool(foundPool);

        // Fetch historical APY data
        const historicalAPYData = await fetchHistoricalAPY(id);
        console.log('Historical APY data received:', historicalAPYData);
        
        if (historicalAPYData && historicalAPYData.length > 0) {
          const monthlyData = getMonthlyAPYData(historicalAPYData);
          console.log('Monthly APY data processed:', monthlyData);
          setHistoricalData(monthlyData);
        } else {
          console.log('No historical APY data available');
          setHistoricalData([]);
        }

      } catch (err) {
        setError('Failed to load pool data. Please try again later.');
        console.error('Error loading pool data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoolData();
  }, [id]);

  const getProjectIcon = (project: string) => {
    const initials = project.split('-').map(word => word[0]).join('').toUpperCase();
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];
    const colorIndex = project.length % colors.length;
    
    return (
      <div className={`w-16 h-16 rounded-2xl ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
        {initials}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lending':
        return 'bg-blue-100 text-blue-800';
      case 'liquid staking':
        return 'bg-green-100 text-green-800';
      case 'yield aggregator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Loading Pool Details</h3>
          <p className="text-slate-500">Fetching the latest data...</p>
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Pool Not Found</h3>
          <p className="text-slate-500 mb-6">{error || 'The requested pool could not be found.'}</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => router.push('/')}
              variant="ghost"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-900">{pool.project}</h1>
              <p className="text-slate-600">{pool.symbol} • {pool.chain}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Pool Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Pool Overview Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4">
                  {getProjectIcon(pool.project)}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{pool.project}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Badge className={`${getCategoryColor(pool.category)} text-sm font-medium px-3 sm:px-4 py-2 rounded-full border w-fit`}>
                        {pool.category}
                      </Badge>
                      <span className="text-slate-500 text-sm">{pool.chain}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200/40">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-green-700 font-medium text-xs sm:text-sm">Current APY</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-900">{formatAPY(pool.apy)}</div>
                  <div className="text-green-600 text-xs sm:text-sm mt-1">30d avg: {formatAPY(pool.apyMean30d)}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200/40">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="text-blue-700 font-medium text-xs sm:text-sm">Total Value Locked</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-900">{formatTVL(pool.tvlUsd)}</div>
                  <div className="text-blue-600 text-xs sm:text-sm mt-1">Market Cap</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 sm:p-6 border border-purple-200/40 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    <span className="text-purple-700 font-medium text-xs sm:text-sm">Risk Metrics</span>
                  </div>
                  <div className="space-y-2">
                    {pool.prediction && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-purple-600">Prediction:</span>
                        <span className="font-semibold text-purple-900">{pool.prediction}%</span>
                      </div>
                    )}
                    {pool.sigma && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-purple-600">Risk Score:</span>
                        <span className="font-semibold text-purple-900">{pool.sigma.toFixed(3)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {pool.poolMeta && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-700 mb-2 text-sm">Pool Metadata</h4>
                    <p className="text-slate-600 text-xs sm:text-sm">{pool.poolMeta}</p>
                  </div>
                )}
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-medium text-slate-700 mb-2 text-sm">Token Information</h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Symbol:</span>
                      <span className="font-medium text-slate-900">{pool.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Chain:</span>
                      <span className="font-medium text-slate-900">{pool.chain}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical APY Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-8 shadow-sm">
              <APYChart data={historicalData} poolName={pool.project} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Token Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Token Details</h3>
              
              {pool.underlyingTokens && pool.underlyingTokens.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Underlying Tokens</h4>
                  <div className="space-y-2">
                    {pool.underlyingTokens.map((token, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs text-slate-700 font-mono break-all leading-relaxed">
                          {token}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pool.rewardTokens && pool.rewardTokens.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Reward Tokens</h4>
                  <div className="space-y-2">
                    {pool.rewardTokens.map((token, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs text-slate-700 font-mono break-all leading-relaxed">
                          {token}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pool.url && (
                <div className="pt-4 border-t border-slate-200">
                  <a 
                    href={pool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View on DeFiLlama
                  </a>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <Calendar className="h-4 w-4 mr-2" />
                  Track Pool
                </Button>
                <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-medium transition-all duration-200">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
