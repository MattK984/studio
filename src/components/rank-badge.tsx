import { Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 0) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">-</div>
    )
  }

  const rankContent = () => {
    if (rank === 1) return <Medal className="size-4 fill-amber-400 text-amber-600" />;
    if (rank === 2) return <Medal className="size-4 fill-slate-400 text-slate-600" />;
    if (rank === 3) return <Medal className="size-4 fill-orange-400 text-orange-600" />;
    return <span className="text-sm font-semibold">{rank}</span>;
  };

  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
        {
          'bg-amber-100': rank === 1,
          'bg-slate-200': rank === 2,
          'bg-orange-200': rank === 3,
          'bg-muted': rank > 3,
        }
      )}
    >
      {rankContent()}
    </div>
  );
}
