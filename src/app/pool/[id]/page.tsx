'use client';

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryColor } from '@/lib/utils';
import { formatPrediction } from '@/lib/api';
import { Activity, DollarSign, Shield, Target, TrendingUp, Menu, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { APYChart } from '@/components/APYChart';
import { Sidebar } from '@/components/Sidebar';
import { Pool, PoolCategory } from '@/types';
import { getPoolsWithFallback } from '@/lib/api';

interface PoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [pool, setPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        setIsLoading(true);
        const pools = await getPoolsWithFallback();
        const foundPool = pools.find(p => p.id === id);
        
        if (foundPool) {
          setPool(foundPool);
        } else {
          setError('Pool not found');
        }
      } catch (err) {
        setError('Failed to fetch pool data');
        console.error('Error fetching pool:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPool();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
        <div className="lg:ml-64">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pool details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pool) {
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
                <h3 className="text-lg font-semibold mb-2">Error Loading Pool</h3>
                <p className="text-muted-foreground mb-4">{error || 'Pool not found'}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hidden lg:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Pool Details</h1>
                <p className="text-sm text-muted-foreground">Detailed information about {pool.project}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Pool Content */}
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Pool Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{pool.project}</h1>
                  <p className="text-lg text-muted-foreground">{pool.symbol}</p>
                </div>
                <Badge variant="secondary" className={`${getCategoryColor(pool.category as PoolCategory)} border`}>
                  {pool.category}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* TVL Card */}
                <Card className="p-4 border-l-4 border-l-blue-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      TVL
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      ${(pool.tvlUsd / 1e6).toFixed(1)}M
                    </p>
                  </div>
                </Card>
                
                {/* APY Card */}
                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-600" />
                      APY
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {pool.apy ? pool.apy.toFixed(2) : '0.00'}%
                      </span>
                      {pool.apy && pool.apy > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </Card>
                
                {/* Prediction Card */}
                <Card className="p-4 border-l-4 border-l-purple-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4 text-purple-600" />
                      Prediction
                    </div>
                    <p className="text-2xl font-bold text-foreground truncate">
                      {formatPrediction(pool.prediction)}
                    </p>
                  </div>
                </Card>
                
                {/* Risk Card */}
                <Card className="p-4 border-l-4 border-l-orange-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-orange-600" />
                      Risk (σ)
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {pool.sigma ? pool.sigma.toFixed(4) : 'N/A'}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* APY Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Historical APY (Last 20 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <APYChart poolId={pool.id} />
              </CardContent>
            </Card>

            {/* Pool Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Underlying Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>Underlying Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  {pool.underlyingTokens && pool.underlyingTokens.length > 0 ? (
                    <div className="space-y-3">
                      {pool.underlyingTokens.map((token, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Token {index + 1}</span>
                            <Badge variant="outline" className="text-xs">Underlying</Badge>
                          </div>
                          <div className="break-all">
                            <span className="text-xs font-monospace text-muted-foreground">
                              {token === '0x0000000000000000000000000000000000000000' ? 'ETH (Native Token)' : token}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No underlying tokens</p>
                  )}
                </CardContent>
              </Card>

              {/* Reward Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>Reward Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  {pool.rewardTokens && pool.rewardTokens.length > 0 ? (
                    <div className="space-y-3">
                      {pool.rewardTokens.map((token, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Reward {index + 1}</span>
                            <Badge variant="outline" className="text-xs">Reward</Badge>
                          </div>
                          <div className="break-all">
                            <span className="text-xs font-monospace text-muted-foreground">
                              {token === '0x0000000000000000000000000000000000000000' ? 'ETH (Native Token)' : token}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reward tokens</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pool Meta */}
            {pool.poolMeta && (
              <Card>
                <CardHeader>
                  <CardTitle>Pool Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{pool.poolMeta}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Chain</label>
                    <p className="text-foreground">{pool.chain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pool Meta</label>
                    <p className="text-foreground">{pool.poolMeta || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">30-Day Average APY</label>
                    <p className="text-foreground">{pool.apyMean30d ? `${pool.apyMean30d.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pool ID</label>
                    <p className="text-foreground font-mono text-sm">{pool.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
