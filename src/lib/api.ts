import { Pool, HistoricalAPY } from '@/types';

// Types for API responses
interface APIPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number | null;
  apyMean30d: number | null;
  predictions?: {
    predictedProbability: number | null;
    predictedClass: string | null;
    binnedConfidence: number | null;
  };
  sigma: number | null;
  poolMeta: string | null;
  underlyingTokens: string[];
  rewardTokens: string[] | null;
}

// DeFiLlama API endpoints
const POOLS_API = 'https://yields.llama.fi/pools';
const CHART_API = 'https://yields.llama.fi/chart';

// Target projects for each category
export const TARGET_PROJECTS = {
  Lending: [
    'aave-v3',
    'compound-v3', 
    'maple',
  ],
  'Liquid Staking': [
    'lido',
    'binance-staked-eth',
    'stader',
  ],
  'Yield Aggregator': [
    'cian-yield-layer',
    'yearn-finance',
    'beefy',
  ],
};

// Fallback sample data in case API is down
export const SAMPLE_POOLS: Pool[] = [
  {
    id: 'sample-aave',
    project: 'aave-v3',
    chain: 'Ethereum',
    category: 'Lending',
    symbol: 'aUSDC',
    tvlUsd: 1250000000,
    apy: 4.25,
    apyMean30d: 4.18,
    prediction: 4.30,
    sigma: 0.85,
    poolMeta: 'USDC Lending Pool',
    underlyingTokens: ['USDC'],
    rewardTokens: ['AAVE'],
    url: 'https://aave.com'
  },
  {
    id: 'sample-compound',
    project: 'compound-v3',
    chain: 'Ethereum',
    category: 'Lending',
    symbol: 'cUSDC',
    tvlUsd: 890000000,
    apy: 3.95,
    apyMean30d: 3.87,
    prediction: 4.05,
    sigma: 0.78,
    poolMeta: 'USDC Lending Pool',
    underlyingTokens: ['USDC'],
    rewardTokens: ['COMP'],
    url: 'https://compound.finance'
  },
  {
    id: 'sample-lido',
    project: 'lido',
    chain: 'Ethereum',
    category: 'Liquid Staking',
    symbol: 'stETH',
    tvlUsd: 21500000000,
    apy: 5.12,
    apyMean30d: 5.08,
    prediction: 5.15,
    sigma: 0.92,
    poolMeta: 'Liquid Staking Pool',
    underlyingTokens: ['ETH'],
    rewardTokens: ['LDO'],
    url: 'https://lido.fi'
  },
  {
    id: 'sample-yearn',
    project: 'yearn-finance',
    chain: 'Ethereum',
    category: 'Yield Aggregator',
    symbol: 'yUSDC',
    tvlUsd: 450000000,
    apy: 6.78,
    apyMean30d: 6.65,
    prediction: 6.85,
    sigma: 1.15,
    poolMeta: 'USDC Yield Strategy',
    underlyingTokens: ['USDC'],
    rewardTokens: ['YFI'],
    url: 'https://yearn.finance'
  }
];

/**
 * Fetch all pools from DeFiLlama API
 */
export async function fetchAllPools(): Promise<APIPool[]> {
  try {
    console.log('Fetching pools from:', POOLS_API);
    const response = await fetch(POOLS_API);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Total pools received:', data.data?.length || 0);
    
    // Test: Log the structure of first few pools
    if (data.data && data.data.length > 0) {
      console.log('First pool structure:', data.data[0]);
      console.log('First pool keys:', Object.keys(data.data[0]));
      console.log('Sample pools (first 3):', data.data.slice(0, 3));
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw error;
  }
}

/**
 * Fetch target pools by filtering the full pool list
 */
export async function fetchTargetPools(): Promise<Pool[]> {
  try {
    const allPools = await fetchAllPools();
    console.log('All pools fetched:', allPools.length);
    
    // Find pools by project name and category
    const targetPools: Pool[] = [];
    
    Object.entries(TARGET_PROJECTS).forEach(([category, projects]) => {
      projects.forEach(projectName => {
        // Find pools that match the project name (case-insensitive)
        const matchingPools = allPools.filter((pool: APIPool) => 
          pool.project.toLowerCase().includes(projectName.toLowerCase()) ||
          projectName.toLowerCase().includes(pool.project.toLowerCase())
        );
        
        if (matchingPools.length > 0) {
          // Take the first matching pool and ensure it has the correct category
          const pool = matchingPools[0];
          const poolWithCategory: Pool = {
            id: pool.pool, // Map 'pool' field to 'id'
            project: pool.project,
            chain: pool.chain,
            category: category,
            symbol: pool.symbol,
            tvlUsd: pool.tvlUsd,
            apy: pool.apy || 0,
            apyMean30d: pool.apyMean30d || 0,
            prediction: pool.predictions?.predictedProbability || 0,
            sigma: pool.sigma || 0,
            poolMeta: pool.poolMeta || undefined,
            underlyingTokens: pool.underlyingTokens || [],
            rewardTokens: pool.rewardTokens || [],
            url: undefined
          };
          targetPools.push(poolWithCategory);
          console.log(`Found pool for ${projectName}:`, pool.project, 'Category:', category);
          console.log('Pool data:', poolWithCategory);
        } else {
          console.log(`No pool found for project: ${projectName}`);
        }
      });
    });
    
    console.log('Target pools found:', targetPools.length);
    console.log('Final target pools array:', targetPools);
    return targetPools;
  } catch (error) {
    console.error('Error fetching target pools:', error);
    throw error;
  }
}

/**
 * Get pools with fallback to sample data
 */
export async function getPoolsWithFallback(): Promise<Pool[]> {
  try {
    console.log('=== Starting getPoolsWithFallback ===');
    
    // First try to fetch target pools
    console.log('1. Attempting to fetch target pools...');
    const targetPools = await fetchTargetPools();
    console.log('2. Target pools result:', targetPools.length, 'pools');
    console.log('3. Target pools data:', targetPools);
    
    if (targetPools.length > 0) {
      console.log('4. ✅ Returning target pools from API');
      return targetPools;
    }
    
    console.log('4. ❌ No target pools found, trying fallback...');
    
    // If no target pools, try to fetch all pools and categorize some
    const allPools = await fetchAllPools();
    if (allPools.length > 0) {
      const examplePools: Pool[] = allPools.slice(0, 9).map((pool: APIPool, index) => ({
        id: pool.pool,
        project: pool.project,
        chain: pool.chain,
        category: index < 3 ? 'Lending' : index < 6 ? 'Liquid Staking' : 'Yield Aggregator',
        symbol: pool.symbol,
        tvlUsd: pool.tvlUsd,
        apy: pool.apy || 0,
        apyMean30d: pool.apyMean30d || 0,
        prediction: pool.predictions?.predictedProbability || 0,
        sigma: pool.sigma || 0,
        poolMeta: pool.poolMeta || undefined,
        underlyingTokens: pool.underlyingTokens || [],
        rewardTokens: pool.rewardTokens || [],
        url: undefined
      }));
      console.log('5. ✅ Returning example pools from API');
      return examplePools;
    }
    
    // If all else fails, return sample data
    console.log('6. ❌ All API calls failed, using sample data');
    return SAMPLE_POOLS;
    
  } catch (error) {
    console.error('7. ❌ Error in getPoolsWithFallback:', error);
    console.log('8. Using sample data due to error');
    return SAMPLE_POOLS;
  }
}

/**
 * Fetch historical APY data for a specific pool
 */
export async function fetchHistoricalAPY(poolId: string): Promise<HistoricalAPY[]> {
  try {
    console.log(`Fetching historical APY for pool: ${poolId}`);
    const response = await fetch(`${CHART_API}/${poolId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Historical APY response for ${poolId}:`, data);
    
    if (data.data && data.data.length > 0) {
      console.log(`Found ${data.data.length} historical data points`);
      console.log('Sample data point:', data.data[0]);
    } else {
      console.log('No historical data found');
    }
    
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching historical APY for pool ${poolId}:`, error);
    throw error;
  }
}

/**
 * Get APY data for the first day of each month for the last 12 months
 */
export function getMonthlyAPYData(historicalData: HistoricalAPY[]): HistoricalAPY[] {
  // If no historical data, return empty array
  if (!historicalData || historicalData.length === 0) {
    console.log('No historical data provided to getMonthlyAPYData');
    return [];
  }

  const monthlyData: HistoricalAPY[] = [];
  const now = new Date();
  
  // Get the last 12 months
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
    
    // Find the closest data point to the first day of the month
    const closest = historicalData.reduce((prev, curr) => {
      // Convert timestamp to number if it's a string
      const currTimestamp = typeof curr.timestamp === 'string' 
        ? Math.floor(new Date(curr.timestamp).getTime() / 1000)
        : curr.timestamp;
      
      const prevTimestamp = typeof prev.timestamp === 'string'
        ? Math.floor(new Date(prev.timestamp).getTime() / 1000)
        : prev.timestamp;
      
      return Math.abs(currTimestamp - targetTimestamp) < Math.abs(prevTimestamp - targetTimestamp) ? curr : prev;
    });
    
    if (closest && closest.timestamp) {
      // Convert string timestamp to number for consistency
      const timestamp = typeof closest.timestamp === 'string' 
        ? Math.floor(new Date(closest.timestamp).getTime() / 1000)
        : closest.timestamp;
      
      // Format the month label
      const date = new Date(timestamp * 1000);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const processedData: HistoricalAPY & { month: string } = {
        ...closest,
        timestamp,
        month
      };
      monthlyData.push(processedData);
    }
  }
  
  console.log('Processed monthly data:', monthlyData);
  return monthlyData;
}

/**
 * Format TVL value for display
 */
export function formatTVL(tvl: number): string {
  if (tvl >= 1e9) {
    return `$${(tvl / 1e9).toFixed(2)}B`;
  } else if (tvl >= 1e6) {
    return `$${(tvl / 1e6).toFixed(2)}M`;
  } else if (tvl >= 1e3) {
    return `$${(tvl / 1e3).toFixed(2)}K`;
  } else {
    return `$${tvl.toFixed(2)}`;
  }
}

/**
 * Format APY value for display
 */
export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export async function getPoolById(poolId: string): Promise<Pool> {
  try {
    const allPools = await getPoolsWithFallback();
    const foundPool = allPools.find(p => p.id === poolId);
    
    if (!foundPool) {
      throw new Error('Pool not found');
    }
    
    return foundPool;
  } catch (error) {
    console.error('Error getting pool by ID:', error);
    throw error;
  }
}
