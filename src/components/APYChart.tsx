'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalAPY } from '@/types';
import { fetchHistoricalAPY, getMonthlyAPYData } from '@/lib/api';

interface APYChartProps {
  poolId: string;
}

export function APYChart({ poolId }: APYChartProps) {
  const [data, setData] = useState<HistoricalAPY[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const historicalAPY = await fetchHistoricalAPY(poolId);
        const monthlyData = getMonthlyAPYData(historicalAPY);
        setData(monthlyData);
        setError(null);
      } catch (err) {
        console.error('Error fetching historical APY:', err);
        setError('Failed to fetch historical data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (poolId) {
      fetchData();
    }
  }, [poolId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Historical Data Available</p>
          <p className="text-sm">Historical APY data is not available at the moment.</p>
        </div>
      </div>
    );
  }

  // Ensure data has month labels, fallback to timestamp if not
  const chartData = data.map(item => ({
    ...item,
    month: item.month || (item.timestamp ? 
      new Date(typeof item.timestamp === 'string' ? parseInt(item.timestamp) * 1000 : item.timestamp * 1000)
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 
      'Unknown'
    )
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="text-xs text-muted-foreground"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs text-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="apy"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          className="chart-line"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
