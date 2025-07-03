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

// We will query for Epoch 6 as requested.
const CURRENT_EPOCH_ID = 6n;

const generateHistoricalData = (base: number) => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.max(0, Math.min(100, base + Math.sin(i / 5) * 5 + (Math.random() - 0.5) * 2)),
    });
  }
  return data;
};

export const fetchDlpData = async (): Promise<Dlp[]> => {
  try {
    const eligibleDlpIds = await dlpRegistryContract.read.eligibleDlpsListValues();

    if (!eligibleDlpIds || eligibleDlpIds.length === 0) {
      console.log('No eligible DLPs found.');
      return [];
    }

    const dlpDataPromises = eligibleDlpIds.map(async (dlpId) => {
      try {
        const dlpInfo = await dlpRegistryContract.read.dlps([dlpId]);

        if (!dlpInfo || !dlpInfo.name) {
          console.warn(`Could not fetch info for DLP ${dlpId}`);
          return null;
        }

        let performanceInfo;
        try {
           performanceInfo = await dlpPerformanceContract.read.epochDlpPerformances([CURRENT_EPOCH_ID, dlpId]);
        } catch (e) {
          console.warn(`Could not fetch performance data for DLP ${dlpId} in epoch ${CURRENT_EPOCH_ID}. It may not exist.`);
          performanceInfo = null; // Set to null if the call fails
        }
        
        const score = performanceInfo ? Number(performanceInfo.totalScore) / 100 : 0;
        const uniqueDatapoints = performanceInfo ? performanceInfo.uniqueContributors : 0n;
        const tradingVolume = performanceInfo ? performanceInfo.tradingVolume : 0n;
        const dataAccessFees = performanceInfo ? performanceInfo.dataAccessFees : 0n;

        // Keep generating mock historical data for the chart for now
        const historicalData = generateHistoricalData(score);
        
        return {
          id: String(dlpInfo.id),
          name: dlpInfo.name || `DLP #${dlpInfo.id}`,
          rank: 0, // will be calculated later
          score,
          uniqueDatapoints,
          tradingVolume,
          dataAccessFees,
          metadata: dlpInfo.metadata || '{}',
          historicalData,
          iconUrl: dlpInfo.iconUrl || '',
          website: dlpInfo.website || '',
          address: dlpInfo.dlpAddress || '0x' + ''.padEnd(40, '0'),
        };

      } catch (error) {
        console.error(`Error processing DLP ${dlpId}:`, error);
        return null;
      }
    });

    const combinedDlps = (await Promise.all(dlpDataPromises))
      .filter((dlp): dlp is Dlp => dlp !== null);

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
