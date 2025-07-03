import type { Dlp } from './types';
import { createPublicClient, http, defineChain, parseAbi } from 'viem';

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
});

const publicClient = createPublicClient({
  chain: vanaMainnet,
  transport: http(),
});

// --- DEVELOPER TODO ---
// Please replace with your actual DLP Registry contract address and ABIs.
const dlpRegistryAddress = '0x0000000000000000000000000000000000000000'; // <- FIXME: Replace with your registry contract address
const dlpRegistryAbi = parseAbi([
  // This is an example ABI. Replace with your actual ABI.
  // It assumes a function that returns a list of all DLP contract addresses.
  'function getAllDlps() view returns (address[])',
]);

// This is an example ABI for an individual DLP contract. Replace with your actual ABI.
const dlpContractAbi = parseAbi([
  'function name() view returns (string)',
  'function score() view returns (uint256)',
  'function uniqueDatapoints() view returns (uint256)',
  'function metadata() view returns (string)', // Assuming metadata is a JSON string
]);
// --- END TODO ---

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
    // In a production app, you might want to check for a zero address
    // and throw a more specific error for the developer.
    if (dlpRegistryAddress === '0x0000000000000000000000000000000000000000') {
      console.warn("DLP Registry contract address is not set. Please update it in src/lib/data.ts. Returning empty array for now.");
      return [];
    }

    const dlpAddresses = await publicClient.readContract({
      address: dlpRegistryAddress,
      abi: dlpRegistryAbi,
      functionName: 'getAllDlps',
    });

    if (!dlpAddresses || dlpAddresses.length === 0) {
      return [];
    }

    const contracts = dlpAddresses.map(address => ({
      address,
      abi: dlpContractAbi,
    }));

    const results = await publicClient.multicall({
      contracts: [
        ...contracts.map(contract => ({ ...contract, functionName: 'name' } as const)),
        ...contracts.map(contract => ({ ...contract, functionName: 'score' } as const)),
        ...contracts.map(contract => ({ ...contract, functionName: 'uniqueDatapoints' } as const)),
        ...contracts.map(contract => ({ ...contract, functionName: 'metadata' } as const)),
      ],
      allowFailure: true,
    });
    
    const dlpsData: Omit<Dlp, 'rank' | 'historicalData'>[] = [];
    const numDlps = dlpAddresses.length;

    for (let i = 0; i < numDlps; i++) {
        const nameRes = results[i];
        const scoreRes = results[i + numDlps];
        const dataPointsRes = results[i + numDlps * 2];
        const metadataRes = results[i + numDlps * 3];

        if (nameRes.status === 'success' && scoreRes.status === 'success' && dataPointsRes.status === 'success') {
            dlpsData.push({
                id: dlpAddresses[i],
                name: nameRes.result as string,
                score: Number(scoreRes.result),
                uniqueDatapoints: Number(dataPointsRes.result),
                metadata: metadataRes.status === 'success' ? (metadataRes.result as string) : '{}',
            });
        } else {
             console.warn(`Failed to fetch complete data for DLP at address ${dlpAddresses[i]}`);
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
