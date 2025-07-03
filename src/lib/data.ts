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
    console.log(`Fetching data for Epoch ${CURRENT_EPOCH_ID}...`);
    const eligibleDlpIds = await dlpRegistryContract.read.eligibleDlpsListValues();

    if (!eligibleDlpIds || eligibleDlpIds.length === 0) {
      console.log('No eligible DLPs found.');
      return [];
    }

    console.log(`Found ${eligibleDlpIds.length} eligible DLPs.`);

    // To avoid the RPC's 10,000 block range limit on getLogs,
    // we'll get the latest block and search the last 9,999 blocks for the events.
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 9999n ? latestBlock - 9999n : 0n;

    // Fetch performance events for the current epoch
    const performanceEvents = await publicClient.getContractEvents({
      address: DLP_PERFORMANCE_ADDRESS,
      abi: DLP_PERFORMANCE_ABI,
      eventName: 'EpochDlpPerformancesSaved',
      args: {
        epochId: CURRENT_EPOCH_ID,
      },
      fromBlock: fromBlock,
    });

    console.log(`Found ${performanceEvents.length} performance events for Epoch ${CURRENT_EPOCH_ID}.`);

    const performanceMap = new Map();
    for (const event of performanceEvents) {
      if (event.args.dlpId !== undefined) {
        performanceMap.set(String(event.args.dlpId), event.args);
      }
    }

    const dlpDataPromises = eligibleDlpIds.map(async (dlpIdBigInt) => {
      const dlpId = String(dlpIdBigInt);
      try {
        const dlpInfo = await dlpRegistryContract.read.dlps([dlpIdBigInt]);

        if (!dlpInfo || !dlpInfo.name) {
          console.warn(`Could not fetch info for DLP ${dlpId}`);
          return null;
        }

        const performanceInfo = performanceMap.get(dlpId);

        const tradingVolumeScore = performanceInfo ? Number(performanceInfo.tradingVolumeScore) / 100 : 0;
        const uniqueContributorsScore = performanceInfo ? Number(performanceInfo.uniqueContributorsScore) / 100 : 0;
        const dataAccessFeesScore = performanceInfo ? Number(performanceInfo.dataAccessFeesScore) / 100 : 0;
        
        // The total score is the sum of the individual scores.
        const totalScore = tradingVolumeScore + uniqueContributorsScore + dataAccessFeesScore;
        
        const uniqueContributors = performanceInfo ? performanceInfo.uniqueContributors : 0n;
        const tradingVolume = performanceInfo ? performanceInfo.tradingVolume : 0n;
        const dataAccessFees = performanceInfo ? performanceInfo.dataAccessFees : 0n;

        // Keep generating mock historical data for the chart for now
        const historicalData = generateHistoricalData(totalScore);
        
        return {
          id: dlpId,
          name: dlpInfo.name || `DLP #${dlpId}`,
          rank: 0, // will be calculated later
          totalScore,
          uniqueContributors,
          tradingVolume,
          dataAccessFees,
          tradingVolumeScore,
          uniqueContributorsScore,
          dataAccessFeesScore,
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
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((dlp, index) => ({
        ...dlp,
        rank: dlp.totalScore > 0 ? index + 1 : 0,
      }));

    console.log(`Successfully processed ${sortedDlps.length} DLPs.`);
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
