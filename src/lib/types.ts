export type HistoricalPoint = {
  date: string;
  score: number;
};

export type Dlp = {
  id: string;
  name: string;
  rank: number;
  totalScore: number;
  uniqueContributors: bigint;
  tradingVolume: bigint;
  dataAccessFees: bigint;
  tradingVolumeScore: number;
  uniqueContributorsScore: number;
  dataAccessFeesScore: number;
  metadata: string;
  historicalData: HistoricalPoint[];
  iconUrl: string;
  website: string;
  address: string;
};
