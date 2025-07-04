
import { createPublicClient, http, defineChain, getContract } from 'viem';
import {
  DLP_REGISTRY_ADDRESS,
  DLP_PERFORMANCE_ADDRESS,
  DLP_REGISTRY_ABI,
  DLP_PERFORMANCE_ABI,
  VANA_EPOCH_ABI,
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
    
    const dlpDataPromises = eligibleDlpIds.map(async (dlpIdBigInt) => {
      const dlpId = String(dlpIdBigInt);
      try {
        // Fetch basic DLP info (name, address, etc.) and performance data in parallel
        const [dlpInfo, performanceInfo] = await Promise.all([
          dlpRegistryContract.read.dlps([dlpIdBigInt]),
          dlpPerformanceContract.read.epochDlpPerformances([epochId, dlpIdBigInt])
        ]);
        
        if (!dlpInfo || !dlpInfo.name) {
          console.warn(`Could not fetch info for DLP ${dlpId}`);
          return null;
        }

        let totalScore = 0;
        let tradingVolumeScore = 0;
        let uniqueContributorsScore = 0;
        let dataAccessFeesScore = 0;
        let uniqueContributors = 0n;
        let tradingVolume = 0n;
        let dataAccessFees = 0n;
        
        if (performanceInfo && performanceInfo.totalScore > 0) {
          console.log(`Found performance data for DLP ${dlpId}:`, performanceInfo);
          // The contract returns scores scaled by 100, so we divide.
          tradingVolumeScore = Number(performanceInfo.tradingVolumeScore) / 100;
          uniqueContributorsScore = Number(performanceInfo.uniqueContributorsScore) / 100;
          dataAccessFeesScore = Number(performanceInfo.dataAccessFeesScore) / 100;
          totalScore = Number(performanceInfo.totalScore) / 100;
          
          uniqueContributors = performanceInfo.uniqueContributors ?? 0n;
          tradingVolume = performanceInfo.tradingVolume ?? 0n;
          dataAccessFees = performanceInfo.dataAccessFees ?? 0n;
        } else {
            console.log(`No performance data found for DLP ${dlpId} for epoch ${epochId}.`);
        }

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
        // If the performance call fails for one DLP, we log the error and return a default object.
        console.error(`Error processing DLP ${dlpId} for epoch ${epochId}:`, error);
        try {
            const dlpInfo = await dlpRegistryContract.read.dlps([dlpIdBigInt]);
            if (!dlpInfo || !dlpInfo.name) return null;

            return {
              id: dlpId,
              name: dlpInfo.name,
              rank: 0,
              totalScore: 0,
              uniqueContributors: 0n,
              tradingVolume: 0n,
              dataAccessFees: 0n,
              tradingVolumeScore: 0,
              uniqueContributorsScore: 0,
              dataAccessFeesScore: 0,
              metadata: dlpInfo.metadata || '{}',
              historicalData: generateHistoricalData(0),
              iconUrl: dlpInfo.iconUrl || '',
              website: dlpInfo.website || '',
              address: dlpInfo.dlpAddress || '0x' + ''.padEnd(40, '0'),
            };
        } catch (infoError) {
            console.error(`Could not fetch basic info for DLP ${dlpId}:`, infoError);
            return null;
        }
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

    console.log(`Successfully processed ${sortedDlps.length} DLPs for Epoch ${epochId}.`);
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
