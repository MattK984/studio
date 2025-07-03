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
    const dlpCountBigInt = await publicClient.readContract({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'dlpsCount',
    });
    const dlpCount = Number(dlpCountBigInt);

    if (dlpCount === 0) {
      console.log('No DLPs found in the registry.');
      return [];
    }

    // Create an array of DLP IDs from 1 to dlpCount
    const dlpIds = Array.from({ length: dlpCount }, (_, i) => BigInt(i + 1));
    
    // First, fetch all DLP information
    const dlpInfoCalls = dlpIds.map(dlpId => ({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'dlps',
      args: [dlpId],
    }));

    const infoResults = await publicClient.multicall({
      contracts: dlpInfoCalls,
      allowFailure: true,
    });

    // Filter for registered DLPs and gather their data
    const registeredDlps: Omit<Dlp, 'rank' | 'historicalData' | 'score' | 'uniqueDatapoints'>[] = [];
    infoResults.forEach(infoResult => {
      if (infoResult.status === 'success' && infoResult.result) {
        const dlpInfo = infoResult.result;
        // DlpStatus enum: 0: UNREGISTERED, 1: REGISTERED, 2: JAILED
        if (dlpInfo.status === 1) {
          registeredDlps.push({
            id: String(dlpInfo.id),
            name: dlpInfo.name,
            metadata: dlpInfo.metadata || '{}',
          });
        }
      }
    });

    if (registeredDlps.length === 0) {
      console.log('No DLPs with status REGISTERED were found.');
      return [];
    }

    // Now, fetch performance data only for the registered DLPs
    const currentEpochId = 0n; // This might need to be made dynamic later
    const performanceCalls = registeredDlps.map(dlp => ({
      address: DLP_PERFORMANCE_ADDRESS,
      abi: DLP_PERFORMANCE_ABI,
      functionName: 'epochDlpPerformances',
      args: [currentEpochId, BigInt(dlp.id)],
    }));

    const perfResults = await publicClient.multicall({
      contracts: performanceCalls,
      allowFailure: true,
    });

    // Combine DLP info with performance data
    const combinedDlps = registeredDlps.map((dlp, index) => {
      const perfResult = perfResults[index];
      let score = 0;
      let uniqueDatapoints = 0;

      if (perfResult.status === 'success' && perfResult.result) {
        score = Number(perfResult.result.totalScore);
        uniqueDatapoints = Number(perfResult.result.uniqueContributors);
      }
      
      return {
        ...dlp,
        score,
        uniqueDatapoints,
      };
    });

    // Sort by score and add rank and historical data
    const sortedDlps = combinedDlps
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