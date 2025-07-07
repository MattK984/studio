
import { createPublicClient, http, defineChain, getContract, formatEther } from 'viem';
import {
  DLP_REGISTRY_ADDRESS,
  DLP_PERFORMANCE_ADDRESS,
  DLP_REGISTRY_ABI,
  DLP_PERFORMANCE_ABI,
} from './contracts';
import type { Dlp, HistoricalPoint } from './types';

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

const generateHistoricalData = (
  baseDlp: Pick<Dlp, 'name' | 'totalScore' | 'uniqueContributors' | 'tradingVolume' | 'dataAccessFees' | 'rewardAmount' | 'penaltyAmount'>
): HistoricalPoint[] => {
  const data: HistoricalPoint[] = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Create a deterministic-ish but varied fluctuation based on DLP name and day
    const fluctuation = (key: string) => Math.sin((i + baseDlp.name.charCodeAt(0)) / (5 + key.length)) * 5 + (Math.random() - 0.5) * 2;

    data.push({
      date: date.toISOString().split('T')[0],
      totalScore: Math.max(0, baseDlp.totalScore + fluctuation('score')),
      uniqueContributors: Math.max(0, Math.round(Number(baseDlp.uniqueContributors) + fluctuation('contributors') * (Number(baseDlp.uniqueContributors) * 0.05))),
      tradingVolume: Math.max(0, Number(baseDlp.tradingVolume) + fluctuation('volume') * (Number(baseDlp.tradingVolume) * 0.05)),
      dataAccessFees: Math.max(0, Number(baseDlp.dataAccessFees) + fluctuation('fees') * (Number(baseDlp.dataAccessFees) * 0.05)),
      rewardAmount: Math.max(0, baseDlp.rewardAmount + fluctuation('reward') * (baseDlp.rewardAmount * 0.05)),
      penaltyAmount: Math.max(0, baseDlp.penaltyAmount + fluctuation('penalty') * (baseDlp.penaltyAmount * 0.05)),
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
        const [dlpInfo, performanceData, rewardData] = await Promise.all([
            dlpRegistryContract.read.dlps([dlpIdBigInt]),
            dlpPerformanceContract.read.epochDlpPerformances([epochId, dlpIdBigInt]),
            dlpPerformanceContract.read.calculateEpochDlpRewards([epochId, dlpIdBigInt])
        ]);
        
        if (!dlpInfo || !dlpInfo.name) {
          console.warn(`Could not fetch info for DLP ${dlpId}`);
          return null;
        }

        const totalScore = Number(formatEther(performanceData.totalScore ?? 0n));
        const uniqueContributors = performanceData.uniqueContributors ?? 0n;
        const tradingVolume = performanceData.tradingVolume ?? 0n;
        const dataAccessFees = performanceData.dataAccessFees ?? 0n;
        const rewardAmount = Number(formatEther(rewardData.rewardAmount ?? 0n));
        const penaltyAmount = Number(formatEther(rewardData.penaltyAmount ?? 0n));

        const baseDlpData = {
          name: dlpInfo.name || `DLP #${dlpId}`,
          totalScore,
          uniqueContributors,
          tradingVolume,
          dataAccessFees,
          rewardAmount,
          penaltyAmount,
        };
        
        return {
          id: dlpId,
          name: dlpInfo.name || `DLP #${dlpId}`,
          rank: 0, // will be calculated later
          totalScore,
          uniqueContributors,
          tradingVolume,
          dataAccessFees,
          tradingVolumeScore: Number(formatEther(performanceData.tradingVolumeScore ?? 0n)),
          uniqueContributorsScore: Number(formatEther(performanceData.uniqueContributorsScore ?? 0n)),
          dataAccessFeesScore: Number(formatEther(performanceData.dataAccessFeesScore ?? 0n)),
          tradingVolumeScorePenalty: Number(formatEther(performanceData.tradingVolumeScorePenalty ?? 0n)),
          uniqueContributorsScorePenalty: Number(formatEther(performanceData.uniqueContributorsScorePenalty ?? 0n)),
          dataAccessFeesScorePenalty: Number(formatEther(performanceData.dataAccessFeesScorePenalty ?? 0n)),
          rewardAmount,
          penaltyAmount,
          metadata: dlpInfo.metadata || '{}',
          historicalData: generateHistoricalData(baseDlpData),
          iconUrl: dlpInfo.iconUrl || '',
          website: dlpInfo.website || '',
          address: dlpInfo.dlpAddress || '0x' + ''.padEnd(40, '0'),
        };

      } catch (error) {
        console.error(`Error processing DLP ${dlpId} for epoch ${epochId}:`, error);
        try {
            const dlpInfo = await dlpRegistryContract.read.dlps([dlpIdBigInt]);
            if (!dlpInfo || !dlpInfo.name) return null;

            const baseDlpData = {
              name: dlpInfo.name,
              totalScore: 0,
              uniqueContributors: 0n,
              tradingVolume: 0n,
              dataAccessFees: 0n,
              rewardAmount: 0,
              penaltyAmount: 0,
            };

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
              tradingVolumeScorePenalty: 0,
              uniqueContributorsScorePenalty: 0,
              dataAccessFeesScorePenalty: 0,
              rewardAmount: 0,
              penaltyAmount: 0,
              metadata: dlpInfo.metadata || '{}',
              historicalData: generateHistoricalData(baseDlpData),
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
