import { gql, request } from 'graphql-request';
import type { Dlp } from './types';

// The Graph endpoint for Vana DLP data
const SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cm168cz887zva010j39il7a6p/subgraphs/vana/7.0.1/gn';

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

// GraphQL query to fetch DLPs and their latest performance scores.
const GET_DLPS_QUERY = gql`
  query GetDlpData {
    dlpinfos(where: { status: "REGISTERED" }, orderBy: name, orderDirection: asc) {
      id
      name
      metadata
      performances(first: 1, orderBy: epoch, orderDirection: desc) {
        totalScore
        uniqueContributors
      }
    }
  }
`;

interface SubgraphDlp {
  id: string;
  name: string;
  metadata: string;
  performances: {
    totalScore: string;
    uniqueContributors: string;
  }[];
}

// Fetches DLP data from the Vana Subgraph.
export const fetchDlpData = async (): Promise<Dlp[]> => {
  try {
    const response = await request<{ dlpinfos: SubgraphDlp[] }>(SUBGRAPH_URL, GET_DLPS_QUERY);

    if (!response.dlpinfos) {
        console.log("No DLP data found in the Subgraph response.");
        return [];
    }

    const dlpsData: Omit<Dlp, 'rank' | 'historicalData'>[] = response.dlpinfos.map(subgraphDlp => {
      const latestPerformance = subgraphDlp.performances?.[0];
      return {
        id: subgraphDlp.id,
        name: subgraphDlp.name,
        metadata: subgraphDlp.metadata || '{}',
        score: latestPerformance ? parseInt(latestPerformance.totalScore, 10) : 0,
        uniqueDatapoints: latestPerformance ? parseInt(latestPerformance.uniqueContributors, 10) : 0,
      };
    });

    const sortedDlps = dlpsData
      .sort((a, b) => b.score - a.score)
      .map((dlp, index) => ({
        ...dlp,
        rank: index + 1,
        historicalData: generateHistoricalData(),
      }));

    return sortedDlps;

  } catch (error) {
    console.error('Error fetching DLP data from Subgraph:', error);
    // Return empty array to prevent the app from crashing
    return [];
  }
};
