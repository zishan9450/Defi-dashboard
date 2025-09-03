'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pool } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, TrendingUp, DollarSign, Activity, ExternalLink } from 'lucide-react';
import { formatPrediction } from '@/lib/api';

interface PoolsTableProps {
  pools: Pool[];
}

export function PoolsTable({ pools }: PoolsTableProps) {
  const router = useRouter();
  const { isYieldAggregatorUnlocked } = useAuth();

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
      <div className={`w-8 h-8 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
        {initials}
      </div>
    );
  };

  const handleRowClick = (pool: Pool) => {
    const isLocked = pool.category === 'Yield Aggregator' && !isYieldAggregatorUnlocked;
    if (!isLocked) {
      router.push(`/pool/${pool.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[220px] font-semibold">Project</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Symbol</TableHead>
              <TableHead className="text-right font-semibold">TVL</TableHead>
              <TableHead className="text-right font-semibold">APY</TableHead>
              <TableHead className="text-right font-semibold">Prediction</TableHead>
              <TableHead className="text-right font-semibold">Risk (σ)</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pools.map((pool) => {
              const isLocked = pool.category === 'Yield Aggregator' && !isYieldAggregatorUnlocked;
              
              return (
                <TableRow 
                  key={pool.id} 
                  className={`transition-colors ${
                    isLocked ? 'opacity-75' : 'hover:bg-muted/50 cursor-pointer'
                  }`}
                  onClick={() => handleRowClick(pool)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getProjectIcon(pool.project)}
                      <div>
                        <div className="font-semibold text-foreground">{pool.project}</div>
                        <div className="text-sm text-muted-foreground">{pool.chain}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="secondary" className={`${getCategoryColor(pool.category)} border`}>
                      {pool.category}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="font-medium text-foreground">
                    {pool.symbol}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        ${(pool.tvlUsd / 1e6).toFixed(1)}M
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {pool.apy ? pool.apy.toFixed(2) : '0.00'}%
                      </span>
                      {pool.apy && pool.apy > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-semibold text-foreground max-w-[80px] block truncate">
                      {formatPrediction(pool.prediction)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-semibold text-foreground">
                      {pool.sigma ? pool.sigma.toFixed(4) : 'N/A'}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {isLocked ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Locked</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/pool/${pool.id}`);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
