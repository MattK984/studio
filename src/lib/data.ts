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
    // 1. Get the total count of all DLPs from the registry contract.
    const dlpCount = await publicClient.readContract({
      address: DLP_REGISTRY_ADDRESS,
      abi: DLP_REGISTRY_ABI,
      functionName: 'dlpsCount',
    });

    if (!dlpCount || dlpCount === 0n) {
      console.log('No DLPs found in the registry.');
      return [];
    }

    // 2. Create an array of DLP IDs from 1 to dlpCount.
    const dlpIds = Array.from({ length: Number(dlpCount) }, (_, i) => BigInt(i + 1));

    // 3. Create multicall requests for info and performance for each DLP ID.
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
      args: [0n, dlpId], // Assuming epochId is 0 for latest performance.
    }));
    
    // 4. Execute the multicalls in a single batch.
    const results = await publicClient.multicall({
      contracts: [...dlpInfoCalls, ...dlpPerformanceCalls],
      allowFailure: true,
    });

    const infoResults = results.slice(0, dlpIds.length);
    const perfResults = results.slice(dlpIds.length);

    // 5. Process the results, combining and filtering the data.
    const combinedDlps = infoResults
      .map((infoResult, index) => {
        if (infoResult.status !== 'success' || !infoResult.result) {
          return null;
        }

        const dlpInfo = infoResult.result as any;
        
        // DlpStatus enum: None, Registered, Eligible, Deregistered
        if (dlpInfo.status !== 1 /* Registered */ && dlpInfo.status !== 2 /* Eligible */) {
          return null;
        }

        const perfResult = perfResults[index];
        let score = 0;
        let uniqueDatapoints = 0;
        let tradingVolume = 0;
        let dataAccessFees = 0;

        if (perfResult && perfResult.status === 'success' && perfResult.result) {
          const perfInfo = perfResult.result as any;
          score = Number(perfInfo.totalScore);
          uniqueDatapoints = Number(perfInfo.uniqueContributors);
          tradingVolume = Number(perfInfo.tradingVolume);
          dataAccessFees = Number(perfInfo.dataAccessFees);
        }

        return {
          id: String(dlpInfo.id),
          name: dlpInfo.name,
          metadata: dlpInfo.metadata || '{}',
          score,
          uniqueDatapoints,
          tradingVolume,
          dataAccessFees,
        };
      })
      .filter((dlp): dlp is NonNullable<typeof dlp> => dlp !== null);
    
    if (combinedDlps.length === 0) {
      console.log('No active DLPs found after filtering.');
      return [];
    }

    // 6. Sort by score and add rank and historical data
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
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
    }
    return [];
  }
};
