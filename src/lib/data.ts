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
    // 1. Get the list of eligible DLP IDs from the registry contract.
    const eligibleDlpIds = await publicClient.readContract({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'eligibleDlpsListValues',
    });

    if (!eligibleDlpIds || eligibleDlpIds.length === 0) {
      console.log('No eligible DLPs found in the registry.');
      return [];
    }

    // 2. Create multicall requests for info and performance for each eligible DLP.
    const calls = eligibleDlpIds.flatMap(dlpId => [
      {
        address: DLP_REGISTRY_ADDRESS,
        abi: DLP_REGISTRY_ABI,
        functionName: 'dlps',
        args: [dlpId],
      },
      {
        address: DLP_PERFORMANCE_ADDRESS,
        abi: DLP_PERFORMANCE_ABI,
        functionName: 'epochDlpPerformances',
        args: [0n, dlpId], // Assuming epochId is 0 for now
      },
    ]);

    const results = await publicClient.multicall({
      contracts: calls,
      allowFailure: true,
    });

    // 3. Process the results and combine the data.
    const combinedDlps = [];
    for (let i = 0; i < eligibleDlpIds.length; i++) {
      const infoResult = results[i * 2];
      const perfResult = results[i * 2 + 1];

      // We must have DLP info to proceed.
      if (infoResult.status === 'success' && infoResult.result) {
        const dlpInfo = infoResult.result;
        
        let score = 0;
        let uniqueDatapoints = 0;

        if (perfResult.status === 'success' && perfResult.result) {
          const perfInfo = perfResult.result;
          score = Number(perfInfo.totalScore);
          uniqueDatapoints = Number(perfInfo.uniqueContributors);
        }

        combinedDlps.push({
          id: String(dlpInfo.id),
          name: dlpInfo.name,
          metadata: dlpInfo.metadata || '{}',
          score,
          uniqueDatapoints,
        });
      }
    }
    
    if (combinedDlps.length === 0) {
      console.log('Could not fetch data for any eligible DLPs.');
      return [];
    }

    // Sort by score and add rank and historical data
    const sortedDlps = combinedDlps
      .sort((a, b) => b.score - a.score)
      .map((dlp, index) => ({
        ...dlp,
        rank: index + 1,
        historicalData: generateHistoricalData(), // Still mocked
      }));

    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP data from smart contracts:', error);
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    return [];
  }
};
