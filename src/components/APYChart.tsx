'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalAPY } from '@/types';

interface APYChartProps {
  data: HistoricalAPY[];
  poolName: string;
}

export function APYChart({ data, poolName }: APYChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Historical APY - {poolName}
          </h3>
          <p className="text-sm text-gray-500">
            Last 12 months (1st day of each month)
          </p>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p>No historical APY data available</p>
            <p className="text-sm">This pool may not have sufficient historical data</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.map(item => {
    if (!item.timestamp) {
      console.warn('Invalid timestamp in data:', item);
      return null;
    }
    
    // Ensure timestamp is a number
    const timestamp = typeof item.timestamp === 'string' 
      ? Math.floor(new Date(item.timestamp).getTime() / 1000)
      : item.timestamp;
    
    return {
      date: new Date(timestamp * 1000).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      }),
      apy: parseFloat(item.apy.toFixed(2)),
      timestamp: timestamp
    };
  }).filter(Boolean); // Remove null entries

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[400px] bg-white rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Historical APY - {poolName}
          </h3>
          <p className="text-sm text-gray-500">
            Last 12 months (1st day of each month)
          </p>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p>Unable to process historical data</p>
            <p className="text-sm">Data format may be invalid</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-green-600 font-semibold">
            APY: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Historical APY - {poolName}
        </h3>
        <p className="text-slate-500 text-sm">
          Last 12 months (1st day of each month)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
            width={50}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="apy" 
            stroke="url(#apyGradient)"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
          />
          <defs>
            <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
