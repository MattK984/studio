import { createPublicClient, http, defineChain } from 'viem';
import {
  DLP_REGISTRY_ADDRESS,
  DLP_PERFORMANCE_ADDRESS,
  DLP_REGISTRY_ABI,
  DLP_PERFORMANCE_ABI,
} from './contracts';
import type { Dlp } from './types';

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
    const eligibleDlpIds = await publicClient.readContract({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'eligibleDlpsListValues',
    });

    if (!eligibleDlpIds || eligibleDlpIds.length === 0) {
      console.log('No eligible DLPs found.');
      return [];
    }
    
    // Using a fixed epochId for now. This might need to be made dynamic later.
    const currentEpochId = 0n;

    const dlpInfoCalls = eligibleDlpIds.map(dlpId => ({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'dlps',
      args: [dlpId],
    }));

    const dlpPerformanceCalls = eligibleDlpIds.map(dlpId => ({
      address: DLP_PERFORMANCE_ADDRESS,
      abi: DLP_PERFORMANCE_ABI,
      functionName: 'epochDlpPerformances',
      args: [currentEpochId, dlpId],
    }));

    const results = await publicClient.multicall({
      contracts: [...dlpInfoCalls, ...dlpPerformanceCalls],
      allowFailure: true,
    });

    const dlpsData: Omit<Dlp, 'rank' | 'historicalData'>[] = [];

    for (let i = 0; i < eligibleDlpIds.length; i++) {
      const infoResult = results[i];
      const perfResult = results[i + eligibleDlpIds.length];

      if (infoResult.status === 'success' && infoResult.result) {
        const dlpInfo = infoResult.result;

        // DLPStatus enum: 0: UNREGISTERED, 1: REGISTERED, 2: JAILED
        if (dlpInfo.status !== 1) {
          continue; // Skip non-registered DLPs
        }

        let score = 0;
        let uniqueDatapoints = 0;

        if (perfResult.status === 'success' && perfResult.result) {
          const dlpPerf = perfResult.result;
          score = Number(dlpPerf.totalScore);
          uniqueDatapoints = Number(dlpPerf.uniqueContributors);
        }

        dlpsData.push({
          id: String(dlpInfo.id),
          name: dlpInfo.name,
          metadata: dlpInfo.metadata || '{}',
          score,
          uniqueDatapoints,
        });
      }
    }

    const sortedDlps = dlpsData
      .sort((a, b) => b.score - a.score)
      .map((dlp, index) => ({
        ...dlp,
        rank: index + 1,
        historicalData: generateHistoricalData(),
      }));
      
    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP data from smart contracts:', error);
    return [];
  }
};
