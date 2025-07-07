export type HistoricalPoint = {
  date: string;
  totalScore: number;
  uniqueContributors: number;
  tradingVolume: number;
  dataAccessFees: number;
  rewardAmount: number;
  penaltyAmount: number;
};

export type Dlp = {
  id: string;
  name: string;
  rank: number;
  totalScore: number;
  uniqueContributors: number;
  tradingVolume: number;
  dataAccessFees: number;
  tradingVolumeScore: number;
  uniqueContributorsScore: number;
  dataAccessFeesScore: number;
  tradingVolumeScorePenalty: number;
  uniqueContributorsScorePenalty: number;
  dataAccessFeesScorePenalty: number;
  rewardAmount: number;
  penaltyAmount: number;
  metadata: string;
  historicalData: HistoricalPoint[];
  iconUrl: string;
  website: string;
  address: string;
};
