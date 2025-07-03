export type HistoricalPoint = {
  date: string;
  score: number;
};

export type Dlp = {
  id: string;
  name: string;
  rank: number;
  score: number;
  uniqueDatapoints: bigint;
  tradingVolume: bigint;
  dataAccessFees: bigint;
  metadata: string;
  historicalData: HistoricalPoint[];
  iconUrl: string;
  website: string;
};
