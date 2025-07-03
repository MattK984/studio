export type HistoricalPoint = {
  date: string;
  score: number;
};

export type Dlp = {
  id: string;
  name: string;
  rank: number;
  score: number;
  uniqueDatapoints: number;
  metadata: string;
  historicalData: HistoricalPoint[];
};
