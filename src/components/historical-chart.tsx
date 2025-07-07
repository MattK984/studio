'use client';

import type { Dlp, HistoricalPoint } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Skeleton } from './ui/skeleton';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type HistoricalChartProps = {
  data: Dlp[];
  loading: boolean;
};

type Metric = keyof Omit<HistoricalPoint, 'date'>;

const metricLabels: Record<Metric, string> = {
  totalScore: 'Total Score',
  uniqueContributors: 'Unique Contributors',
  tradingVolume: 'Trading Volume',
  dataAccessFees: 'Data Access Fees',
  rewardAmount: 'Reward Amount',
  penaltyAmount: 'Penalty Amount',
};

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const formatNumber = (num: number) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  if (num < 100 && num !== Math.floor(num)) {
    return num.toFixed(1);
  }
  return Math.round(num).toString();
};


export function HistoricalChart({ data, loading }: HistoricalChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('totalScore');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!data || data.length === 0 || !data[0]?.historicalData) {
    return (
      <div className="flex flex-col gap-4">
         <div className="flex justify-end">
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as Metric)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a metric" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(metricLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          No historical data available.
        </div>
      </div>
    );
  }
  
  const chartConfig = data.reduce((config, dlp, i) => {
    config[dlp.id] = {
      label: dlp.name,
      color: chartColors[i % chartColors.length],
    };
    return config;
  }, {} as ChartConfig);
  
  const formattedData = data[0]?.historicalData.map((_, i) => {
    const entry: {[key: string]: string | number} = {
      date: data[0].historicalData[i].date,
    };
    data.forEach(dlp => {
      entry[dlp.id] = dlp.historicalData[i]?.[selectedMetric] ?? 0;
    });
    return entry;
  }) || [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as Metric)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a metric" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={formattedData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={['auto', 'auto']}
              tickFormatter={(value) => formatNumber(value as number)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            {data.map(dlp => (
              <Line
                key={dlp.id}
                dataKey={dlp.id}
                type="monotone"
                stroke={chartConfig[dlp.id]?.color}
                strokeWidth={2}
                dot={false}
                name={dlp.name}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
