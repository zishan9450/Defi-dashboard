// Types for DeFi Dashboard

export interface Pool {
  id: string;
  project: string;
  chain: string;
  category: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyMean30d: number;
  prediction?: number;
  sigma?: number;
  poolMeta?: string;
  underlyingTokens?: string[];
  rewardTokens?: string[];
  url?: string;
}

export interface HistoricalAPY {
  timestamp: string | number; // API returns ISO date strings, we convert to numbers
  apy: number;
  tvlUsd?: number;
  apyBase?: number;
  apyReward?: number | null;
  il7d?: number | null;
  apyBase7d?: number | null;
  month?: string; // Formatted month label for charts
}

export interface PoolChartData {
  poolId: string;
  data: HistoricalAPY[];
}

export type PoolCategory = 'Lending' | 'Liquid Staking' | 'Yield Aggregator';

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
}

export interface UserAuth {
  isLoggedIn: boolean;
  email?: string;
}
