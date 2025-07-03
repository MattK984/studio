import type { Dlp } from './types';
import { createPublicClient, http, defineChain } from 'viem';
import { DLP_REGISTRY_ADDRESS, DLP_PERFORMANCE_ADDRESS, DLP_REGISTRY_ABI, DLP_PERFORMANCE_ABI } from './contracts';

// Vana mainnet configuration
const vanaMainnet = defineChain({
  id: 1480,
  name: 'Vana',
  network: 'vana',
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
      blockCreated: 25,
    },
  },
});

const publicClient = createPublicClient({
  chain: vanaMainnet,
  transport: http(),
});

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

// Fetches DLP data from the Vana blockchain.
export const fetchDlpData = async (): Promise<Dlp[]> => {
  try {
    const dlpIds = await publicClient.readContract({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'eligibleDlpsListValues',
    });

    if (!dlpIds || dlpIds.length === 0) {
      console.log("No eligible DLPs found.");
      return [];
    }

    // --- DEVELOPER NOTE ---
    // Assuming epoch 0 is the latest relevant epoch.
    // In a production app, you might need a way to dynamically determine the current epochId.
    const epochId = 0n;

    const dlpInfoCalls = dlpIds.map(dlpId => ({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'dlps',
      args: [dlpId],
    }));

    const dlpPerformanceCalls = dlpIds.map(dlpId => ({
      address: DLP_PERFORMANCE_ADDRESS,
      abi: DLP_PERFORMANCE_ABI,
      functionName: 'epochDlpPerformances',
      args: [epochId, dlpId],
    }));

    const results = await publicClient.multicall({
      contracts: [...dlpInfoCalls, ...dlpPerformanceCalls],
      allowFailure: true, // Continue if some calls fail
    });
    
    const dlpsData: Omit<Dlp, 'rank' | 'historicalData'>[] = [];
    const numDlps = dlpIds.length;

    for (let i = 0; i < numDlps; i++) {
        const dlpInfoRes = results[i];
        const performanceRes = results[i + numDlps];

        if (dlpInfoRes.status === 'success' && dlpInfoRes.result && performanceRes.status === 'success' && performanceRes.result) {
            const dlpInfo = dlpInfoRes.result;
            const performanceInfo = performanceRes.result;

            // The 'id' for React keys should be a unique string. The DLP address is a good candidate.
            dlpsData.push({
                id: dlpInfo.dlpAddress,
                name: dlpInfo.name,
                score: Number(performanceInfo.totalScore),
                uniqueDatapoints: Number(performanceInfo.uniqueContributors),
                metadata: dlpInfo.metadata || '{}',
            });
        } else {
             console.warn(`Failed to fetch complete data for DLP ID ${dlpIds[i]}. Info status: ${dlpInfoRes.status}, Perf status: ${performanceRes.status}`);
        }
    }
    
    const sortedDlps = dlpsData
        .sort((a, b) => b.score - a.score)
        .map((dlp, index) => ({
            ...dlp,
            rank: index + 1,
            historicalData: generateHistoricalData(), // Historical data remains mocked
        }));

    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP data from smart contract:', error);
    // Return empty array to prevent app from crashing
    return [];
  }
};
