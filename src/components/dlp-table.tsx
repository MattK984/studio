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
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './ui/chart';

type DlpTableProps = {
  data: Dlp[];
  loading: boolean;
  selectable?: boolean;
};

// Function to format large numbers
const formatNumber = (num: number) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  if (num < 1 && num > 0) {
    return num.toFixed(2);
  }
  return Math.round(num).toString();
};

const truncateAddress = (address: string) => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function DlpTable({ data, loading, selectable = false }: DlpTableProps) {
  const [selectedDlps, setSelectedDlps] = useState<Set<string>>(new Set());

  const handleSelectDlp = (dlpId: string) => {
    setSelectedDlps(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(dlpId)) {
        newSelection.delete(dlpId);
      } else {
        newSelection.add(dlpId);
      }
      return newSelection;
    });
  };

  const comparisonData = data.filter(dlp => selectedDlps.has(dlp.id));
  
  const chartData = [
    { metric: 'Score', ...Object.fromEntries(comparisonData.map(d => [d.name, d.totalScore]))},
    { metric: 'Contributors', ...Object.fromEntries(comparisonData.map(d => [d.name, d.uniqueContributors]))},
    { metric: 'Volume', ...Object.fromEntries(comparisonData.map(d => [d.name, d.tradingVolume]))},
    { metric: 'Fees', ...Object.fromEntries(comparisonData.map(d => [d.name, d.dataAccessFees]))},
  ];

  const chartConfig = comparisonData.reduce((config, dlp, i) => {
    config[dlp.name] = {
      label: dlp.name,
      color: `hsl(var(--chart-${(i % 5) + 1}))`,
    };
    return config;
  }, {} as any);


  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div>
      {selectable && comparisonData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
               <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" tickFormatter={(value) => formatNumber(value as number)} />
                 <YAxis dataKey="metric" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <ChartLegend content={<ChartLegendContent />} />
                 {comparisonData.map((dlp) => (
                   <Bar key={dlp.id} dataKey={dlp.name} fill={chartConfig[dlp.name].color} radius={4} />
                 ))}
               </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
       {selectable && comparisonData.length === 0 && (
         <div className="flex items-center justify-center h-64 text-muted-foreground bg-muted/50 rounded-lg mb-6">
            <p>Select DLPs from the table below to compare.</p>
         </div>
       )}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              {selectable && <TableHead className="w-[50px]"></TableHead>}
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>DLP Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Unique Contributors</TableHead>
              <TableHead className="text-right">Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dlp) => (
              <TableRow key={dlp.id} className="border-b-0" data-state={selectedDlps.has(dlp.id) ? 'selected' : ''}>
                {selectable && (
                  <TableCell>
                    <Checkbox 
                      checked={selectedDlps.has(dlp.id)}
                      onCheckedChange={() => handleSelectDlp(dlp.id)}
                      aria-label={`Select ${dlp.name}`}
                    />
                  </TableCell>
                )}
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
                <TableCell className="text-right font-medium text-primary">{dlp.totalScore.toFixed(1)}</TableCell>
                <TableCell className="text-right">{formatNumber(dlp.uniqueContributors)}</TableCell>
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
    </div>
  );
}
