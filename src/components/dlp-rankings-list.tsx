'use client';

import type { Dlp } from '@/lib/types';
import { DlpRankingCard } from './dlp-ranking-card';
import { Skeleton } from './ui/skeleton';

type DlpRankingsListProps = {
  data: Dlp[];
  loading: boolean;
};

export function DlpRankingsList({ data, loading }: DlpRankingsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
           <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No DLP data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((dlp) => (
        <DlpRankingCard key={dlp.id} dlp={dlp} />
      ))}
    </div>
  );
}
