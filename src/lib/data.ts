import type { Dlp } from './types';

const DLP_NAMES = [
  'Hyperion Vanguard',
  'Nexus Prime',
  'Orion Syndicate',
  'Cygnus Arch',
  'Aether Flow',
  'Quantum Leap',
  'Stellar Bridge',
  'Helios Protocol',
];

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

const generateMockData = (): Dlp[] => {
  return DLP_NAMES.map((name, index) => ({
    id: `dlp-${index + 1}`,
    name,
    rank: index + 1,
    score: Math.floor(Math.random() * 200) + 800,
    uniqueDatapoints: Math.floor(Math.random() * 50000) + 10000,
    metadata: JSON.stringify({
      strategy: ['volatility_hedging', 'yield_farming', 'arbitrage'][index % 3],
      assets: [['VANA', 'USDC'], ['ETH', 'VANA'], ['BTC', 'VANA']][index % 3],
      apy_24h: (Math.random() * 0.1).toFixed(4),
      total_value_locked: Math.floor(Math.random() * 2000000) + 500000,
      risk_level: ['low', 'medium', 'high'][index % 3],
      inceptionDate: `2023-0${(index % 9) + 1}-15`,
      description: `The ${name} DLP specializes in ${['stablecoin pairs', 'volatile assets', 'cross-chain swaps'][index % 3]} to optimize liquidity provision.`
    }),
    historicalData: generateHistoricalData(),
  })).sort((a, b) => b.score - a.score).map((dlp, index) => ({...dlp, rank: index + 1}));
};


export const fetchDlpData = (): Promise<Dlp[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockData());
    }, 1000);
  });
};
