'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import type { Dlp } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { DlpSummary } from './dlp-summary';
import { RankBadge } from './rank-badge';

type DlpTableProps = {
  data: Dlp[];
  loading: boolean;
};

// Function to format large numbers
const formatNumber = (num: bigint | number) => {
  const number = Number(num);
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1) + 'M';
  }
  if (number >= 1_000) {
    return (number / 1_000).toFixed(1) + 'K';
  }
  return number.toString();
};

const truncateAddress = (address: string) => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function DlpTable({ data, loading }: DlpTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>DLP Name</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Unique Datapoints</TableHead>
            <TableHead className="text-right">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dlp) => (
            <TableRow key={dlp.id} className="border-b-0">
              <TableCell className="font-medium">
                <RankBadge rank={dlp.rank} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{dlp.name}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">{dlp.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            AI-Powered Metadata Summary
                          </p>
                        </div>
                        <DlpSummary metadata={dlp.metadata} />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium text-green-600">{dlp.score.toFixed(1)}</TableCell>
              <TableCell className="text-right">{formatNumber(dlp.uniqueDatapoints)}</TableCell>
              <TableCell className="text-right">
                <a
                  href={`https://vanascan.io/address/${dlp.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-end gap-2 text-muted-foreground hover:text-foreground"
                >
                  {truncateAddress(dlp.address)}
                  <ExternalLink className="size-4" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
