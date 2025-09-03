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

// Target projects for each category with specific pool IDs
export const TARGET_PROJECTS = {
  Lending: [
    { name: 'aave-v3', poolId: 'db678df9-3281-4bc2-a8bb-01160ffd6d48' },
    { name: 'compound-v3', poolId: 'c1ca08e4-d618-415e-ad63-fcec58705469' },
    { name: 'maple', poolId: '8edfdf02-cdbb-43f7-bca6-954e5fe56813' },
  ],
  'Liquid Staking': [
    { name: 'lido', poolId: '747c1d2a-c668-4682-b9f9-296708a3dd90' },
    { name: 'binance-staked-eth', poolId: '80b8bf92-b953-4c20-98ea-c9653ef2bb98' },
    { name: 'stader', poolId: '90bfb3c2-5d35-4959-a275-ba5085b08aa3' },
  ],
  'Yield Aggregator': [
    { name: 'cian-yield-layer', poolId: '107fb915-ab29-475b-b526-d0ed0d3e6110' },
    { name: 'yearn-finance', poolId: '05a3d186-2d42-4e21-b1f0-68c079d22677' },
    { name: 'beefy', poolId: '1977885c-d5ae-4c9e-b4df-863b7e1578e6' },
  ],
};

// Fallback sample data in case API is down
export const SAMPLE_POOLS: Pool[] = [
  {
    id: 'db678df9-3281-4bc2-a8bb-01160ffd6d48', // aave-v3
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
    id: 'c1ca08e4-d618-415e-ad63-fcec58705469', // compound-v3
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
    id: '8edfdf02-cdbb-43f7-bca6-954e5fe56813', // maple
    project: 'maple',
    chain: 'Ethereum',
    category: 'Lending',
    symbol: 'mUSDC',
    tvlUsd: 750000000,
    apy: 6.50,
    apyMean30d: 6.45,
    prediction: 6.55,
    sigma: 0.65,
    poolMeta: 'USDC Lending Pool',
    underlyingTokens: ['USDC'],
    rewardTokens: ['MPL'],
    url: 'https://maple.finance'
  },
  {
    id: '747c1d2a-c668-4682-b9f9-296708a3dd90', // lido
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
    id: '80b8bf92-b953-4c20-98ea-c9653ef2bb98', // binance-staked-eth
    project: 'binance-staked-eth',
    chain: 'Ethereum',
    category: 'Liquid Staking',
    symbol: 'BETH',
    tvlUsd: 8500000000,
    apy: 4.85,
    apyMean30d: 4.82,
    prediction: 4.88,
    sigma: 0.78,
    poolMeta: 'Liquid Staking Pool',
    underlyingTokens: ['ETH'],
    rewardTokens: ['BNB'],
    url: 'https://binance.com'
  },
  {
    id: '90bfb3c2-5d35-4959-a275-ba5085b08aa3', // stader
    project: 'stader',
    chain: 'Ethereum',
    category: 'Liquid Staking',
    symbol: 'ETHx',
    tvlUsd: 3200000000,
    apy: 4.95,
    apyMean30d: 4.91,
    prediction: 4.98,
    sigma: 0.85,
    poolMeta: 'Liquid Staking Pool',
    underlyingTokens: ['ETH'],
    rewardTokens: ['SD'],
    url: 'https://staderlabs.com'
  },
  {
    id: '107fb915-ab29-475b-b526-d0ed0d3e6110', // cian-yield-layer
    project: 'cian-yield-layer',
    chain: 'Ethereum',
    category: 'Yield Aggregator',
    symbol: 'CYL',
    tvlUsd: 450000000,
    apy: 8.75,
    apyMean30d: 8.68,
    prediction: 8.82,
    sigma: 1.25,
    poolMeta: 'Yield Aggregator Pool',
    underlyingTokens: ['USDC', 'ETH'],
    rewardTokens: ['CYL'],
    url: 'https://cian.finance'
  },
  {
    id: '05a3d186-2d42-4e21-b1f0-68c079d22677', // yearn-finance
    project: 'yearn-finance',
    chain: 'Ethereum',
    category: 'Yield Aggregator',
    symbol: 'yUSDC',
    tvlUsd: 680000000,
    apy: 7.25,
    apyMean30d: 7.18,
    prediction: 7.32,
    sigma: 1.15,
    poolMeta: 'Yield Aggregator Pool',
    underlyingTokens: ['USDC'],
    rewardTokens: ['YFI'],
    url: 'https://yearn.finance'
  },
  {
    id: '1977885c-d5ae-4c9e-b4df-863b7e1578e6', // beefy
    project: 'beefy',
    chain: 'Ethereum',
    category: 'Yield Aggregator',
    symbol: 'BIFI',
    tvlUsd: 320000000,
    apy: 9.50,
    apyMean30d: 9.42,
    prediction: 9.58,
    sigma: 1.45,
    poolMeta: 'Yield Aggregator Pool',
    underlyingTokens: ['USDC', 'ETH', 'WBTC'],
    rewardTokens: ['BIFI'],
    url: 'https://beefy.finance'
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
    
    // Find pools by specific pool ID first, then fallback to project name
    const targetPools: Pool[] = [];
    
    Object.entries(TARGET_PROJECTS).forEach(([category, projects]) => {
      projects.forEach(project => {
        // First try to find by exact pool ID
        let pool = allPools.find((p: APIPool) => p.pool === project.poolId);
        
        // If not found by ID, try to find by project name
        if (!pool) {
          const matchingPools = allPools.filter((p: APIPool) => 
            p.project.toLowerCase().includes(project.name.toLowerCase()) ||
            project.name.toLowerCase().includes(p.project.toLowerCase())
          );
          pool = matchingPools[0];
        }
        
        if (pool) {
          const poolWithCategory: Pool = {
            id: project.poolId, // Use the specific pool ID from our config
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
          console.log(`Found pool for ${project.name}:`, pool.project, 'Category:', category, 'Pool ID:', project.poolId);
          console.log('Pool data:', poolWithCategory);
        } else {
          console.log(`No pool found for project: ${project.name} with ID: ${project.poolId}`);
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
 * Format prediction value to prevent decimal overflow
 */
export function formatPrediction(prediction: number | null | undefined): string {
  if (prediction === null || prediction === undefined) return 'N/A';
  
  // If prediction is a whole number, show as integer
  if (Number.isInteger(prediction)) {
    return `${prediction}%`;
  }
  
  // If prediction has many decimal places, limit to 2
  const formatted = prediction.toFixed(2);
  
  // Remove trailing zeros after decimal
  const cleanFormatted = formatted.replace(/\.?0+$/, '');
  
  return `${cleanFormatted}%`;
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
      
      // Log the date range of the data
      const firstTimestamp = data.data[0].timestamp;
      const lastTimestamp = data.data[data.data.length - 1].timestamp;
      const firstDate = new Date(firstTimestamp);
      const lastDate = new Date(lastTimestamp);
      console.log(`Data spans from ${firstDate.toISOString()} to ${lastDate.toISOString()}`);
      
      // Check if we have enough data for 20 months
      const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                        (lastDate.getMonth() - firstDate.getMonth());
      console.log(`Data covers approximately ${monthsDiff} months`);
      
      if (monthsDiff < 20) {
        console.log(`ℹ️ Pool ${poolId} has ${monthsDiff} months of data. Chart will show available data points.`);
      }
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
 * Get APY data for the first day of each month for the last 20 months
 */
export function getMonthlyAPYData(historicalData: HistoricalAPY[]): (HistoricalAPY & { month: string })[] {
  // If no historical data, return empty array
  if (!historicalData || historicalData.length === 0) {
    console.log('No historical data provided to getMonthlyAPYData');
    return [];
  }

  console.log('Processing historical data:', historicalData.length, 'points');
  console.log('Sample data point:', historicalData[0]);

  // Sort data by timestamp (oldest first)
  const sortedData = [...historicalData].filter(item => item.timestamp != null).sort((a, b) => {
    const timestampA = typeof a.timestamp === 'string' 
      ? new Date(a.timestamp).getTime() 
      : (a.timestamp as number) * 1000;
    const timestampB = typeof b.timestamp === 'string' 
      ? new Date(b.timestamp).getTime() 
      : (b.timestamp as number) * 1000;
    return timestampA - timestampB;
  });

  // Get the date range
  const firstDate = new Date(typeof sortedData[0].timestamp === 'string' 
    ? sortedData[0].timestamp 
    : (sortedData[0].timestamp as number) * 1000);
  const lastDate = new Date(typeof sortedData[sortedData.length - 1].timestamp === 'string' 
    ? sortedData[sortedData.length - 1].timestamp 
    : (sortedData[sortedData.length - 1].timestamp as number) * 1000);

  console.log('Data range:', firstDate.toISOString(), 'to', lastDate.toISOString());

  // Create monthly buckets
  const monthlyBuckets: { [key: string]: HistoricalAPY[] } = {};
  
  sortedData.forEach(item => {
    if (!item.timestamp) return; // Skip items without timestamp
    
    const timestamp = typeof item.timestamp === 'string' 
      ? new Date(item.timestamp).getTime() 
      : (item.timestamp as number) * 1000;
    const date = new Date(timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey] = [];
    }
    monthlyBuckets[monthKey].push(item);
  });

  console.log('Monthly buckets:', Object.keys(monthlyBuckets));

  // Generate up to 20 months of data, starting from the most recent month
  const monthlyData: (HistoricalAPY & { month: string })[] = [];
  const now = new Date();
  
  // Generate up to 20 months of data points
  for (let i = 19; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    const month = targetDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Try to find data for this month
    let monthData: HistoricalAPY | null = null;
    
    if (monthlyBuckets[monthKey] && monthlyBuckets[monthKey].length > 0) {
      // Use the first data point of the month
      monthData = monthlyBuckets[monthKey].sort((a, b) => {
        const timestampA = typeof a.timestamp === 'string' 
          ? new Date(a.timestamp).getTime() 
          : (a.timestamp as number) * 1000;
        const timestampB = typeof b.timestamp === 'string' 
          ? new Date(b.timestamp).getTime() 
          : (b.timestamp as number) * 1000;
        return timestampA - timestampB;
      })[0];
    } else {
      // If no data for this month, find the closest data point
      const targetTimestamp = targetDate.getTime();
      const closest = sortedData.reduce((prev, curr) => {
        const currTimestamp = typeof curr.timestamp === 'string' 
          ? new Date(curr.timestamp).getTime() 
          : (curr.timestamp as number) * 1000;
        const prevTimestamp = typeof prev.timestamp === 'string' 
          ? new Date(prev.timestamp).getTime() 
          : (prev.timestamp as number) * 1000;
        
        return Math.abs(currTimestamp - targetTimestamp) < Math.abs(prevTimestamp - targetTimestamp) ? curr : prev;
      });
      
      monthData = closest;
    }
    
    if (monthData) {
      const processedData: HistoricalAPY & { month: string } = {
        ...monthData,
        timestamp: typeof monthData.timestamp === 'string' 
          ? Math.floor(new Date(monthData.timestamp).getTime() / 1000)
          : (monthData.timestamp as number),
        month
      };
      monthlyData.push(processedData);
    }
  }

  console.log('Final processed monthly data:', monthlyData.length, 'points');
  console.log('Sample processed data:', monthlyData[0]);
  
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
