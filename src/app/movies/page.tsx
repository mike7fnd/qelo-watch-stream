'use client';

import { useEffect, useState } from 'react';
import { getPopularMovies } from '@/lib/tmdb';
import type { Media } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="aspect-[2/3]">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPopularMovies()
      .then((data) => {
        const movieResults = data.results.map(m => ({...m, media_type: 'movie' as const}));
        setMovies(movieResults);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <div className="container max-w-screen-2xl py-8 animate-fade-in-up">
        <h1 className="mb-8 text-3xl font-bold">Movies</h1>
        {loading ? (
          <GridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {movies.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
