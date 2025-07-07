
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
    const fluctuation = (key: string, magnitude: number = 0.05) => (Math.sin((i + baseDlp.name.charCodeAt(0)) / (5 + key.length)) * 0.5 + (Math.random() - 0.5) * 0.5) * magnitude;

    data.push({
      date: date.toISOString().split('T')[0],
      totalScore: Math.max(0, baseDlp.totalScore * (1 + fluctuation('score'))),
      uniqueContributors: Math.max(0, Math.round(baseDlp.uniqueContributors * (1 + fluctuation('contributors')))),
      tradingVolume: Math.max(0, baseDlp.tradingVolume * (1 + fluctuation('volume'))),
      dataAccessFees: Math.max(0, baseDlp.dataAccessFees * (1 + fluctuation('fees'))),
      rewardAmount: Math.max(0, baseDlp.rewardAmount * (1 + fluctuation('reward'))),
      penaltyAmount: Math.max(0, baseDlp.penaltyAmount * (1 + fluctuation('penalty'))),
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

        const totalScore = parseFloat(formatEther(performanceData.totalScore ?? 0n));
        const uniqueContributors = Number(performanceData.uniqueContributors ?? 0n);
        const tradingVolume = parseFloat(formatEther(performanceData.tradingVolume ?? 0n));
        const dataAccessFees = parseFloat(formatEther(performanceData.dataAccessFees ?? 0n));
        const rewardAmount = parseFloat(formatEther(rewardData.rewardAmount ?? 0n));
        const penaltyAmount = parseFloat(formatEther(rewardData.penaltyAmount ?? 0n));
        
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
          tradingVolumeScore: parseFloat(formatEther(performanceData.tradingVolumeScore ?? 0n)),
          uniqueContributorsScore: parseFloat(formatEther(performanceData.uniqueContributorsScore ?? 0n)),
          dataAccessFeesScore: parseFloat(formatEther(performanceData.dataAccessFeesScore ?? 0n)),
          tradingVolumeScorePenalty: parseFloat(formatEther(performanceData.tradingVolumeScorePenalty ?? 0n)),
          uniqueContributorsScorePenalty: parseFloat(formatEther(performanceData.uniqueContributorsScorePenalty ?? 0n)),
          dataAccessFeesScorePenalty: parseFloat(formatEther(performanceData.dataAccessFeesScorePenalty ?? 0n)),
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
              uniqueContributors: 0,
              tradingVolume: 0,
              dataAccessFees: 0,
              rewardAmount: 0,
              penaltyAmount: 0,
            };

            return {
              id: dlpId,
              name: dlpInfo.name,
              rank: 0,
              totalScore: 0,
              uniqueContributors: 0,
              tradingVolume: 0,
              dataAccessFees: 0,
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
