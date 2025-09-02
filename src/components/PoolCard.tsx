'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pool } from '@/types';
import { formatTVL, formatAPY } from '@/lib/api';
import { Lock, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface PoolCardProps {
  pool: Pool;
  isLocked?: boolean;
  onClick?: () => void;
}

export function PoolCard({ pool, isLocked, onClick }: PoolCardProps) {
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
      <div className={`w-12 h-12 rounded-xl ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
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
    <div 
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-300 ${
        isLocked ? 'opacity-60' : 'hover:scale-[1.02]'
      }`}
    >
      <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${
        isLocked ? 'ring-2 ring-orange-200/50' : 'hover:border-slate-300/60'
      }`}>
        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-orange-600 font-medium text-sm">Connect Wallet to Unlock</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {getProjectIcon(pool.project)}
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{pool.project}</h3>
              <p className="text-slate-500 text-sm">{pool.symbol}</p>
            </div>
          </div>
          <Badge className={`${getCategoryColor(pool.category)} text-xs font-medium px-3 py-1 rounded-full border`}>
            {pool.category}
          </Badge>
        </div>

        {/* APY Section */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-medium">Current APY</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatAPY(pool.apy)}
            </div>
            <div className="text-slate-500 text-sm">
              30d avg: {formatAPY(pool.apyMean30d)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-xs font-medium mb-1">TVL</div>
            <div className="text-slate-900 font-semibold">{formatTVL(pool.tvlUsd)}</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-xs font-medium mb-1">Chain</div>
            <div className="text-slate-900 font-semibold text-sm">{pool.chain}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          {pool.prediction && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Prediction Score</span>
              <span className="font-medium text-slate-700">{pool.prediction}%</span>
            </div>
          )}
          {pool.sigma && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Risk Score</span>
              <span className="font-medium text-slate-700">{pool.sigma.toFixed(3)}</span>
            </div>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
