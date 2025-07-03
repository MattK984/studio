'use client';

import type { Dlp } from '@/lib/types';
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

type HistoricalChartProps = {
  data: Dlp[];
  loading: boolean;
};

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function HistoricalChart({ data, loading }: HistoricalChartProps) {
  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No historical data available.
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
      entry[dlp.id] = dlp.historicalData[i]?.score || 0;
    });
    return entry;
  }) || [];

  return (
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
            domain={['dataMin - 20', 'dataMax + 20']}
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
  );
}
