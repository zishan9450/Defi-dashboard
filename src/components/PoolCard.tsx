'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pool } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, TrendingUp, DollarSign, Activity, Shield, Target } from 'lucide-react';
import { formatPrediction } from '@/lib/api';

interface PoolCardProps {
  pool: Pool;
}

export function PoolCard({ pool }: PoolCardProps) {
  const router = useRouter();
  const { isYieldAggregatorUnlocked } = useAuth();
  
  const isLocked = pool.category === 'Yield Aggregator' && !isYieldAggregatorUnlocked;
  
  const handleClick = () => {
    if (!isLocked) {
      router.push(`/pool/${pool.id}`);
    }
  };

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

  const getProjectIcon = (project: string) => {
    const initials = project.split('-').map(word => word[0]).join('').toUpperCase();
    const colors = [
      'bg-gradient-to-br from-primary to-primary/80',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];
    const colorIndex = project.length % colors.length;
    
    return (
      <div className={`w-12 h-12 rounded-xl ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
        {initials}
      </div>
    );
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isLocked ? 'opacity-75' : 'hover:scale-[1.02] cursor-pointer hover:shadow-lg'
      }`} 
      onClick={handleClick}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-card border rounded-lg p-4 text-center shadow-lg">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Connect Wallet to Unlock</p>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getProjectIcon(pool.project)}
            <div>
              <CardTitle className="text-lg text-card-foreground mb-1">{pool.project}</CardTitle>
              <p className="text-sm text-muted-foreground">{pool.symbol}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`${getCategoryColor(pool.category)} border`}>
            {pool.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              TVL
            </div>
            <p className="text-xl font-bold text-card-foreground">
              ${(pool.tvlUsd / 1e6).toFixed(1)}M
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              APY
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-card-foreground">
                {pool.apy ? pool.apy.toFixed(2) : '0.00'}%
              </span>
              {pool.apy && pool.apy > 0 && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </div>
        
        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Prediction
            </div>
            <p className="font-semibold text-card-foreground truncate">
              {formatPrediction(pool.prediction)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Risk (σ)
            </div>
            <p className="font-semibold text-card-foreground">
              {pool.sigma ? pool.sigma.toFixed(4) : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Action Button */}
        {!isLocked && (
          <Button 
            variant="outline" 
            className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/pool/${pool.id}`);
            }}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
