'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, Hash, Sigma } from 'lucide-react';
import type { Dlp } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { DlpSummary } from './dlp-summary';
import { cn } from '@/lib/utils';

type DlpTableProps = {
  data: Dlp[];
  loading: boolean;
  selectedDlps: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
};

export function DlpTable({
  data,
  loading,
  selectedDlps,
  onSelectAll,
  onSelectRow,
  allSelected,
  someSelected,
}: DlpTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Skeleton className="h-5 w-5" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected || (someSelected ? 'indeterminate' : false)}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead>DLP Name</TableHead>
            <TableHead className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <Hash className="size-4 text-muted-foreground" />
                    <span>Rank</span>
                </div>
            </TableHead>
            <TableHead className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    <span>Score</span>
                </div>
            </TableHead>
            <TableHead className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <Sigma className="size-4 text-muted-foreground" />
                    <span>Unique Datapoints</span>
                </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dlp) => (
            <TableRow
              key={dlp.id}
              data-state={selectedDlps.includes(dlp.id) ? 'selected' : 'unselected'}
              className={cn('data-[state=selected]:bg-accent/50')}
            >
              <TableCell>
                <Checkbox
                  checked={selectedDlps.includes(dlp.id)}
                  onCheckedChange={(checked) => onSelectRow(dlp.id, !!checked)}
                  aria-label={`Select row for ${dlp.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span>{dlp.name}</span>
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
              <TableCell className="text-right">{dlp.rank}</TableCell>
              <TableCell className="text-right">{dlp.score}</TableCell>
              <TableCell className="text-right">{dlp.uniqueDatapoints.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
