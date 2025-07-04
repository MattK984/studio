
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

export const fetchDlpData = async (epochId: bigint): Promise<Dlp[]> => {
  try {
    console.log(`Fetching data for Epoch ${epochId}...`);
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

    console.log(`Searching for events from block ${fromBlock} to ${latestBlock}.`);

    // Fetch both saved and overridden performance events for the selected epoch
    const [savedEvents, overriddenEvents] = await Promise.all([
      publicClient.getContractEvents({
        address: DLP_PERFORMANCE_ADDRESS,
        abi: DLP_PERFORMANCE_ABI,
        eventName: 'EpochDlpPerformancesSaved',
        args: { epochId: epochId },
        fromBlock,
        toBlock: latestBlock,
      }),
      publicClient.getContractEvents({
        address: DLP_PERFORMANCE_ADDRESS,
        abi: DLP_PERFORMANCE_ABI,
        eventName: 'EpochDlpPerformancesOverridden',
        args: { epochId: epochId },
        fromBlock,
        toBlock: latestBlock,
      }),
    ]);
    
    console.log(`Found ${savedEvents.length} 'Saved' events and ${overriddenEvents.length} 'Overridden' events for Epoch ${epochId}.`);

    const performanceMap = new Map();
    // Process saved events first
    for (const event of savedEvents) {
      if (event.args.dlpId !== undefined) {
        performanceMap.set(String(event.args.dlpId), event.args);
      }
    }
    // Process overridden events, overwriting any saved data
    for (const event of overriddenEvents) {
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
        
        let totalScore = 0;
        let tradingVolumeScore = 0;
        let uniqueContributorsScore = 0;
        let dataAccessFeesScore = 0;
        let uniqueContributors = 0n;
        let tradingVolume = 0n;
        let dataAccessFees = 0n;
        
        if (performanceInfo) {
          console.log(`Found performance data for DLP ${dlpId}:`, performanceInfo);
          tradingVolumeScore = performanceInfo.tradingVolumeScore ? Number(performanceInfo.tradingVolumeScore) / 100 : 0;
          uniqueContributorsScore = performanceInfo.uniqueContributorsScore ? Number(performanceInfo.uniqueContributorsScore) / 100 : 0;
          dataAccessFeesScore = performanceInfo.dataAccessFeesScore ? Number(performanceInfo.dataAccessFeesScore) / 100 : 0;
          totalScore = tradingVolumeScore + uniqueContributorsScore + dataAccessFeesScore;
          
          uniqueContributors = performanceInfo.uniqueContributors ?? 0n;
          tradingVolume = performanceInfo.tradingVolume ?? 0n;
          dataAccessFees = performanceInfo.dataAccessFees ?? 0n;
        } else {
            console.log(`No performance data found for DLP ${dlpId} in event logs.`);
        }

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
