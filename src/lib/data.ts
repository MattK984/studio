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

const dlpRegistryContract = getContract({
  address: DLP_REGISTRY_ADDRESS,
  abi: DLP_REGISTRY_ABI,
  client: { public: publicClient },
});

const dlpPerformanceContract = getContract({
  address: DLP_PERFORMANCE_ADDRESS,
  abi: DLP_PERFORMANCE_ABI,
  client: { public: publicClient },
});

const CURRENT_EPOCH_ID = 3n;

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

    const dlpDataPromises = eligibleDlpIds.map(async (dlpIdBigInt) => {
      try {
        const dlpInfo = await dlpRegistryContract.read.dlps([dlpIdBigInt]);

        if (!dlpInfo || !dlpInfo.id) {
            return null;
        }
        
        // Use mock data for scores and other performance metrics
        const historicalData = generateHistoricalData();
        const score = historicalData.length > 0 ? historicalData[historicalData.length - 1].score : 0;
        const uniqueDatapoints = BigInt(Math.floor(Math.random() * 5000) + 1000);
        const tradingVolume = BigInt(Math.floor(Math.random() * 100000) + 50000);
        const dataAccessFees = BigInt(Math.floor(Math.random() * 20000) + 1000);
        
        return {
            id: String(dlpInfo.id),
            name: dlpInfo.name || `DLP #${dlpInfo.id}`,
            rank: 0, // Will be set after sorting
            score,
            uniqueDatapoints,
            tradingVolume,
            dataAccessFees,
            metadata: dlpInfo.metadata || '{}',
            historicalData,
            iconUrl: dlpInfo.iconUrl || '',
            website: dlpInfo.website || '',
        };

      } catch (error) {
        console.error(`Error processing DLP ${dlpIdBigInt}:`, error);
        return null;
      }
    });

    const combinedDlps = (await Promise.all(dlpDataPromises))
        .filter((dlp): dlp is Dlp => dlp !== null);


    // 4. Sort by score and assign ranks
    const sortedDlps = combinedDlps
      .sort((a, b) => b.score - a.score)
      .map((dlp, index) => ({
        ...dlp,
        rank: dlp.score > 0 ? index + 1 : 0,
      }));

    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP data:', error);
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    return [];
  }
};
