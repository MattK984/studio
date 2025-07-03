'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetchDlpData } from '@/lib/data';
import type { Dlp } from '@/lib/types';
import { Loader2, RefreshCw, Trophy, TrendingUp, Users, Settings, Search } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { DlpTable } from '@/components/dlp-table';
import { HistoricalChart } from '@/components/historical-chart';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function Home() {
  const [data, setData] = useState<Dlp[]>([]);
  const [filteredData, setFilteredData] = useState<Dlp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadData = () => {
    setLoading(true);
    fetchDlpData()
      .then(fetchedData => {
        setData(fetchedData);
        setFilteredData(fetchedData);
        setLastUpdated(new Date());
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not retrieve DLP performance data. Please try again.",
        })
      })
      .finally(() => setLoading(false));
  };

  const handleRefresh = () => {
    startTransition(loadData);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    const filtered = data.filter(dlp => dlp.name.toLowerCase().includes(query));
    setFilteredData(filtered);
  };
  
  useEffect(() => {
    loadData();
  }, []);

  const topScoreDlps = [...data].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  const bestRankedDlps = [...data].sort((a, b) => a.rank - b.rank).filter(d => d.rank > 0).slice(0, 3);
  const mostContributorsDlps = [...data].sort((a, b) => Number(b.uniqueContributors) - Number(a.uniqueContributors)).slice(0, 3);
  
  const [customMetric, setCustomMetric] = useState('rewards');
  const topCustomMetricDlps = [...data].sort((a, b) => {
    if (customMetric === 'rewards') return Number(b.dataAccessFees) - Number(a.dataAccessFees);
    if (customMetric === 'volume') return Number(b.tradingVolume) - Number(a.tradingVolume);
    return 0;
  }).slice(0, 3);


  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vana DLP Performance</h1>
            <p className="text-muted-foreground">Real-time performance metrics for Data Liquidity Pools</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <p className="text-sm text-muted-foreground">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
            </p>
            <Button variant="outline" onClick={handleRefresh} disabled={isPending || loading}>
              {isPending || loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              <span className="ml-2 hidden md:inline">Refresh</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top DLP Score</CardTitle>
              <Trophy className="size-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 my-1 w-full" />) : topScoreDlps.map(dlp => (
                <div key={dlp.id} className="flex items-center justify-between text-sm py-1">
                  <span>{dlp.name}</span>
                  <span className="font-bold">{dlp.totalScore.toFixed(1)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Best Ranked</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 my-1 w-full" />) : bestRankedDlps.map(dlp => (
                <div key={dlp.id} className="flex items-center justify-between text-sm py-1">
                  <span>{dlp.name}</span>
                  <div className="px-2 py-0.5 bg-foreground text-background text-xs rounded-md font-bold">#{dlp.rank}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Most Contributors</CardTitle>
              <Users className="size-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 my-1 w-full" />) : mostContributorsDlps.map(dlp => (
                <div key={dlp.id} className="flex items-center justify-between text-sm py-1">
                  <span>{dlp.name}</span>
                  <div className="px-2 py-0.5 bg-foreground text-background text-xs rounded-md font-bold">{formatNumber(dlp.uniqueContributors)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Custom Metric</CardTitle>
              <Settings className="size-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <Select defaultValue={customMetric} onValueChange={setCustomMetric}>
                <SelectTrigger className="mb-2">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rewards">Data Access Fees</SelectItem>
                  <SelectItem value="volume">Trading Volume</SelectItem>
                </SelectContent>
              </Select>
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 my-1 w-full" />) : topCustomMetricDlps.map(dlp => (
                <div key={dlp.id} className="flex items-center justify-between text-sm py-1">
                  <span>{dlp.name}</span>
                  <div className="px-2 py-0.5 bg-foreground text-background text-xs rounded-md font-bold">{formatNumber(customMetric === 'rewards' ? dlp.dataAccessFees : dlp.tradingVolume)} VANA</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="current">Current Scores</TabsTrigger>
              <TabsTrigger value="historical">Historical Data</TabsTrigger>
              <TabsTrigger value="compare">Compare DLPs</TabsTrigger>
            </TabsList>
            <div className="relative mt-4 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search DLPs..." className="pl-10 w-full sm:w-64" onChange={handleSearch}/>
            </div>
          </div>
          <TabsContent value="current" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>DLP Performance Overview</CardTitle>
                <CardDescription>
                  Current performance metrics for all Data Liquidity Pools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DlpTable data={filteredData} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="historical" className="mt-6">
            <Card>
               <CardHeader>
                <CardTitle>Historical Performance</CardTitle>
                <CardDescription>
                  View performance score trends over the last 30 days for all DLPs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoricalChart data={data} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="compare" className="mt-6">
             <Card>
               <CardHeader>
                <CardTitle>Compare DLPs</CardTitle>
                <CardDescription>
                  Select multiple DLPs from the table to compare them side-by-side.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DlpTable data={filteredData} loading={loading} selectable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
