'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetchDlpData } from '@/lib/data';
import type { Dlp } from '@/lib/types';
import { BarChart, List, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { DlpRankingsList } from '@/components/dlp-rankings-list';
import { HistoricalChart } from '@/components/historical-chart';

export default function Home() {
  const [data, setData] = useState<Dlp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadData = () => {
    setLoading(true);
    fetchDlpData()
      .then(setData)
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
    startTransition(() => {
      loadData();
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl md:text-3xl font-bold font-headline">VanaDLP Insights</h1>
          </div>
          <Button onClick={handleRefresh} disabled={isPending || loading}>
            {isPending || loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            <span className="ml-2 hidden md:inline">Refresh Data</span>
          </Button>
        </header>

        <Tabs defaultValue="rankings">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="rankings"><Trophy className="mr-2" />Rankings</TabsTrigger>
            <TabsTrigger value="historical"><BarChart className="mr-2" />Historical View</TabsTrigger>
          </TabsList>
          <TabsContent value="rankings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
                <CardDescription>
                  DLPs ranked by their total performance score.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DlpRankingsList
                  data={data}
                  loading={loading}
                />
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
        </Tabs>
      </main>
    </div>
  );
}
