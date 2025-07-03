'use client';

import type { Dlp } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Users } from 'lucide-react';
import { RankBadge } from './rank-badge';
import { cn } from '@/lib/utils';

export function DlpRankingCard({ dlp }: { dlp: Dlp }) {
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <RankBadge rank={dlp.rank} />
          <Avatar className="h-12 w-12 hidden sm:flex">
            <AvatarImage src={dlp.iconUrl} alt={`${dlp.name} logo`} />
            <AvatarFallback>{getInitials(dlp.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">{dlp.name}</h3>
              {dlp.website && (
                <a
                  href={dlp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`${dlp.name} website`}
                >
                  <Globe className="size-4 shrink-0" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">DLP #{dlp.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 text-right">
          <div className="hidden md:block">
            <p className="text-lg font-bold">{dlp.score}</p>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </div>
          <div>
            <div className="flex items-center justify-end gap-1 sm:gap-2">
               <Users className="size-4 text-muted-foreground" />
               <p className="text-lg font-bold">{dlp.uniqueDatapoints.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">Contributors</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
