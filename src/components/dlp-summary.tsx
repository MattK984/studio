'use client';

import { summarizeDlpMetadata } from '@/ai/flows/summarize-dlp-metadata';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export function DlpSummary({ metadata }: { metadata: string }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getSummary() {
      setLoading(true);
      setError('');
      try {
        const result = await summarizeDlpMetadata({ metadata });
        setSummary(result.summary);
      } catch (e) {
        console.error('Error summarizing metadata:', e);
        setError('Could not generate summary.');
      } finally {
        setLoading(false);
      }
    }
    getSummary();
  }, [metadata]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return <p className="text-sm text-foreground/80">{summary}</p>;
}
