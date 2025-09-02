'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Pool } from '@/types';
import { formatTVL, formatAPY } from '@/lib/api';

interface PoolsTableProps {
  pools: Pool[];
  isYieldAggregatorUnlocked: boolean;
  onPoolClick: (pool: Pool) => void;
}

export function PoolsTable({ pools, isYieldAggregatorUnlocked, onPoolClick }: PoolsTableProps) {
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
      <div className={`w-8 h-8 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
        {initials}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'liquid staking':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'yield aggregator':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/60">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pool
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                APY
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                TVL
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Risk
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {pools.map((pool) => {
              const isLocked = pool.category.toLowerCase() === 'yield aggregator' && !isYieldAggregatorUnlocked;
              
              return (
                <tr 
                  key={pool.id}
                  onClick={() => !isLocked && onPoolClick(pool)}
                  className={`transition-all duration-200 ${
                    isLocked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-slate-50/80 cursor-pointer'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getProjectIcon(pool.project)}
                      <div>
                        <div className="font-medium text-slate-900">{pool.project}</div>
                        <div className="text-sm text-slate-500">{pool.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getCategoryColor(pool.category)} text-xs font-medium px-2 py-1 rounded-full border`}>
                      {pool.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-slate-900">
                        {formatAPY(pool.apy)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatAPY(pool.apyMean30d)} 30d avg
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {formatTVL(pool.tvlUsd)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{pool.chain}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {pool.prediction && (
                        <div className="text-sm">
                          <span className="text-slate-500">Pred: </span>
                          <span className="font-medium text-slate-700">{pool.prediction}%</span>
                        </div>
                      )}
                      {pool.sigma && (
                        <div className="text-sm">
                          <span className="text-slate-500">Risk: </span>
                          <span className="font-medium text-slate-700">{pool.sigma.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
