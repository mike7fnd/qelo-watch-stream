'use client';

import { useWatchProgress } from '@/hooks/use-watch-progress';
import { getTvShowDetails } from '@/lib/tmdb';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import type { TVShowDetails } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams, useParams } from 'next/navigation';

export default function PlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const season = searchParams.get('s') ?? '1';
  const episode = searchParams.get('e') ?? '1';
  
  const [show, setShow] = useState<TVShowDetails | null>(null);
  const { progress, setProgress } = useWatchProgress(`${id}-s${season}-e${episode}`);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchShow() {
      try {
        const showDetails = await getTvShowDetails(id);
        setShow(showDetails);
      } catch (error) {
        console.error("Failed to fetch show details:", error);
      }
    }
    fetchShow();
  }, [id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPlaying(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Assume playing on mount if tab is visible
    setIsPlaying(!document.hidden);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (show && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const totalSeconds = (show.episode_run_time[0] || 45) * 60;
          const increment = 100 / totalSeconds;
          return Math.min(prev + increment, 100);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [show, isPlaying, setProgress]);

  if (!show) {
    return (
      <div className="container mx-auto p-4 md:p-8 animate-pulse">
        <Skeleton className="mb-4 h-8 w-1/4" />
        <Skeleton className="mb-4 h-8 w-1/2" />
        <div className="aspect-video w-full">
            <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="mb-4">
        <Link href={`/series/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>
      </div>
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{show.name} - S{season} E{episode}</h1>
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={`https://www.vidking.net/embed/tv/${id}?s=${season}&e=${episode}`}
          className="h-full w-full"
          allowFullScreen
          title={`Watch ${show.name}`}
        ></iframe>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Watch Progress</h3>
        <div className="mt-2 flex items-center gap-4">
            <Progress value={progress} className="w-full h-2" />
            <span className="text-sm font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Your watch progress is saved automatically. Progress is estimated while this page is open.
        </p>
      </div>
    </div>
  );
}
