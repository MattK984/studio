import { cn } from '@/lib/utils';

export function RankBadge({ rank, className }: { rank: number, className?: string }) {
  if (rank === 0) {
    return (
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground", className)}>-</div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full shrink-0 bg-foreground text-background text-xs font-bold',
        className
      )}
    >
      #{rank}
    </div>
  );
}
