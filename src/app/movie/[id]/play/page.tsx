
'use client';

import { useWatchProgress } from '@/hooks/use-watch-progress';
import { getMovieDetails } from '@/lib/tmdb';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import type { MovieDetails } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PlayPage() {
  const params = useParams();
  const id = params.id as string;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const { progress, setProgress } = useWatchProgress(id);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const movieDetails = await getMovieDetails(id);
        setMovie(movieDetails);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      }
    }
    fetchMovie();
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
    if (movie && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const totalSeconds = (movie.runtime || 90) * 60;
          const increment = 100 / totalSeconds;
          return Math.min(prev + increment, 100);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [movie, isPlaying, setProgress]);

  if (!movie) {
    return (
      <div className="container mx-auto p-4 md:p-8 animate-pulse">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-4 h-8 w-1/2" />
        <div className="aspect-video w-full">
            <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-7 w-48 mb-2" />
          <div className="mt-2 flex items-center gap-4">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="mb-4">
        <Link href={`/movie/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Link>
      </div>
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{movie.title}</h1>
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={`https://www.vidking.net/embed/movie/${id}?color=dc2626`}
          className="h-full w-full"
          allowFullScreen
          title={`Watch ${movie.title}`}
        ></iframe>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Watch Progress</h3>
        <div className="mt-2 flex items-center gap-4">
            <Progress value={progress} className="w-full h-2" />
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Your watch progress is saved automatically. Progress is estimated while this page is open.
        </p>
      </div>
    </div>
  );
}
