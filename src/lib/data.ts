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

    // 2. Fetch all DLP info.
    const dlpInfoPromises = eligibleDlpIds.map(dlpId => {
      return dlpRegistryContract.read.dlps([dlpId]).catch(err => {
        console.warn(`Could not fetch info for DLP ${dlpId}:`, err);
        return null;
      });
    });

    const dlpInfosRaw = await Promise.all(dlpInfoPromises);

    const combinedDlps: Dlp[] = [];
    
    // 3. Process the results, filtering out any nulls
    dlpInfosRaw.forEach(dlpInfo => {
      if (dlpInfo && dlpInfo.id > 0) {
        const id = String(dlpInfo.id);
        const historicalData = generateHistoricalData();
        const currentScore = historicalData.length > 0 ? historicalData[historicalData.length - 1].score : 0;
        
        combinedDlps.push({
          id,
          name: dlpInfo.name || `DLP #${id}`,
          rank: 0, // Will be set after sorting
          score: Math.round(currentScore), // Use the latest mock score
          uniqueDatapoints: 0n, // Placeholder
          tradingVolume: 0n, // Placeholder
          dataAccessFees: 0n, // Placeholder
          metadata: dlpInfo.metadata || '{}',
          historicalData: historicalData,
          iconUrl: dlpInfo.iconUrl || '',
          website: dlpInfo.website || '',
        });
      }
    });

    // 4. Sort by score and assign ranks
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
