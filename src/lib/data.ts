import { createPublicClient, http, defineChain, getContract } from 'viem';
import {
  DLP_REGISTRY_ADDRESS,
  DLP_PERFORMANCE_ADDRESS,
  DLP_REGISTRY_ABI,
  DLP_PERFORMANCE_ABI,
} from './contracts';
import type { Dlp } from './types';
import type { Abi } from 'viem';

// Vana mainnet configuration
const vanaMainnet = defineChain({
  id: 1480,
  name: 'Vana',
  nativeCurrency: {
    decimals: 18,
    name: 'VANA',
    symbol: 'VANA',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.vana.org'],
    },
    public: {
      http: ['https://rpc.vana.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Vanascan', url: 'https://vanascan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 195487,
    },
  },
});

const publicClient = createPublicClient({
  chain: vanaMainnet,
  transport: http(),
});

// Use epoch 3 directly, as suggested by the working snippet.
const CURRENT_EPOCH_ID = 3n;

const dlpRegistryContract = getContract({
  address: DLP_REGISTRY_ADDRESS,
  abi: DLP_REGISTRY_ABI,
  client: { public: publicClient },
});

const dlpPerformanceContract = getContract({
  address: DLP_PERFORMANCE_ADDRESS,
  abi: DLP_PERFORMANCE_ABI as Abi, // Cast to Abi to satisfy getContract
  client: { public: publicClient },
});

// Generates mock historical data for the chart.
const generateHistoricalData = () => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 40) + 50 + Math.sin(i / 5) * 10,
    });
  }
  return data;
};

// Fetches DLP data from the Vana smart contracts.
export const fetchDlpData = async (): Promise<Dlp[]> => {
  try {
    // 1. Get eligible DLP IDs from the registry contract.
    const eligibleDlpIds = await dlpRegistryContract.read.eligibleDlpsListValues();

    if (!eligibleDlpIds || eligibleDlpIds.length === 0) {
      console.log('No eligible DLPs found in the registry.');
      return [];
    }

    // 2. Fetch info and performance for each eligible DLP.
    const dlpDataPromises = eligibleDlpIds.map(async (dlpId) => {
      try {
        const dlpInfo = await dlpRegistryContract.read.dlps([dlpId]);

        if (!dlpInfo || !dlpInfo.name) {
          return null;
        }

        let performanceInfo = null;
        try {
          // Attempt to fetch performance data, but don't let it crash the whole process.
          performanceInfo = await dlpPerformanceContract.read.epochDlpPerformances([CURRENT_EPOCH_ID, dlpId]);
        } catch (perfError: any) {
          console.warn(`Could not fetch performance data for DLP ${dlpId}: ${perfError.shortMessage || perfError.message}`);
          // Proceed with null performanceInfo, which will be handled below.
        }

        return {
          id: String(dlpInfo.id),
          name: dlpInfo.name,
          metadata: dlpInfo.metadata || '{}',
          score: performanceInfo ? Number(performanceInfo.totalScore) : 0,
          uniqueDatapoints: performanceInfo ? performanceInfo.uniqueContributors : 0n,
          tradingVolume: performanceInfo ? performanceInfo.tradingVolume : 0n,
          dataAccessFees: performanceInfo ? performanceInfo.dataAccessFees : 0n,
        };
      } catch (error) {
        console.error(`Error processing data for DLP ${dlpId}:`, error);
        return null;
      }
    });

    // 3. Wait for all promises to resolve and filter out any nulls (errors).
    const combinedDlps = (await Promise.all(dlpDataPromises))
      .filter((dlp): dlp is NonNullable<typeof dlp> => dlp !== null);
      
    if (combinedDlps.length === 0) {
      console.log('No active DLPs found after filtering.');
      return [];
    }

    // 4. Sort by score and add rank and historical data
    const sortedDlps = combinedDlps
      .sort((a, b) => b.score - a.score)
      .map((dlp, index) => ({
        ...dlp,
        rank: index + 1,
        historicalData: generateHistoricalData(),
      }));

    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP leaderboard data:', error);
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    return [];
  }
};