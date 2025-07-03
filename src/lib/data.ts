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
  abi: DLP_PERFORMANCE_ABI as Abi,
  client: { public: publicClient },
});

// Use epoch 3 directly
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

    // 2. Fetch all DLP info and create a map for easy lookup.
    const dlpInfoPromises = eligibleDlpIds.map(dlpId => dlpRegistryContract.read.dlps([dlpId]));
    const dlpInfosRaw = await Promise.all(dlpInfoPromises);
    
    const dlpMap = new Map<string, Dlp>();
    dlpInfosRaw.forEach(dlpInfo => {
      if (dlpInfo && dlpInfo.id > 0) {
        const id = String(dlpInfo.id);
        dlpMap.set(id, {
          id,
          name: dlpInfo.name || `DLP #${id}`,
          rank: 0,
          score: 0,
          uniqueDatapoints: 0n,
          tradingVolume: 0n,
          dataAccessFees: 0n,
          metadata: dlpInfo.metadata || '{}',
          historicalData: generateHistoricalData(),
          iconUrl: dlpInfo.iconUrl || '',
          website: dlpInfo.website || '',
        });
      }
    });

    // 3. Fetch performance data from event logs for Epoch 3
    const performanceLogs = await publicClient.getLogs({
      address: DLP_PERFORMANCE_ADDRESS,
      event: {
        type: 'event',
        name: 'EpochDlpPerformancesSaved',
        inputs: [
          { name: 'epochId', type: 'uint256', indexed: true },
          { name: 'dlpId', type: 'uint256', indexed: true },
          { name: 'tradingVolume', type: 'uint256', indexed: false },
          { name: 'uniqueContributors', type: 'uint256', indexed: false },
          { name: 'dataAccessFees', type: 'uint256', indexed: false },
          { name: 'tradingVolumeScore', type: 'uint256', indexed: false },
          { name: 'uniqueContributorsScore', type: 'uint256', indexed: false },
          { name: 'dataAccessFeesScore', type: 'uint256', indexed: false },
        ],
      },
      args: {
        epochId: CURRENT_EPOCH_ID,
      },
      fromBlock: 0n, // Search from the beginning.
      toBlock: 'latest',
    });
    
    // 4. If logs are found, calculate scores and update the map
    if (performanceLogs.length > 0) {
        const metricWeights = await dlpPerformanceContract.read.metricWeights();
        
        performanceLogs.forEach(log => {
            const { dlpId, tradingVolume, uniqueContributors, dataAccessFees, tradingVolumeScore, uniqueContributorsScore, dataAccessFeesScore } = log.args;
            const dlpIdStr = String(dlpId);

            if (dlpIdStr && dlpMap.has(dlpIdStr)) {
                const totalScore = 
                    ((tradingVolumeScore ?? 0n) * (metricWeights.tradingVolume ?? 0n) +
                    (uniqueContributorsScore ?? 0n) * (metricWeights.uniqueContributors ?? 0n) +
                    (dataAccessFeesScore ?? 0n) * (metricWeights.dataAccessFees ?? 0n)) / 1000000000000000000n;

                const dlp = dlpMap.get(dlpIdStr)!;
                dlp.score = Number(totalScore);
                dlp.uniqueDatapoints = uniqueContributors ?? 0n;
                dlp.tradingVolume = tradingVolume ?? 0n;
                dlp.dataAccessFees = dataAccessFees ?? 0n;
            }
        });
    }

    // 5. Convert map to array, sort, and assign ranks
    const combinedDlps = Array.from(dlpMap.values());
    
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
