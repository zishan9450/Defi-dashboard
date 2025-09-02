'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { APYChart } from '@/components/APYChart';
import { Pool } from '@/types';
import { getPoolById } from '@/lib/api';
import { ArrowLeft, TrendingUp, DollarSign, Activity, Shield, Target, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        setLoading(true);
        const poolData = await getPoolById(id);
        setPool(poolData);
        setError(null);
      } catch (err) {
        console.error('Error fetching pool:', err);
        setError('Failed to fetch pool data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [id]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lending':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Liquid Staking':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Yield Aggregator':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-20">
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
      <div className="flex h-screen bg-background">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-20">
                <div className="text-destructive text-lg mb-4">⚠️ Error</div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Pool Detail Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Pool Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{pool.project}</h1>
                  <p className="text-lg text-muted-foreground">{pool.symbol}</p>
                </div>
                <Badge variant="secondary" className={`${getCategoryColor(pool.category)} border`}>
                  {pool.category}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    TVL
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    ${(pool.tvlUsd / 1e6).toFixed(1)}M
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    APY
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-card-foreground">
                      {pool.apy ? pool.apy.toFixed(2) : '0.00'}%
                    </span>
                    {pool.apy && pool.apy > 0 && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Prediction
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {pool.prediction ? `${pool.prediction}%` : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Risk (σ)
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {pool.sigma ? pool.sigma.toFixed(4) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* APY Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Historical APY (Last 12 Months)
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
                            <span className="text-xs font-mono text-muted-foreground">
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
                            <Badge variant="secondary" className="text-xs">Reward</Badge>
                          </div>
                          <div className="break-all">
                            <span className="text-xs font-mono text-muted-foreground">
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

            {/* Additional Info */}
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
