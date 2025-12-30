
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPopularTvShows } from '@/lib/tmdb';
import type { Media, PaginatedResponse } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Paginator } from '@/components/paginator';

interface SeriesGridProps {
  initialShows: PaginatedResponse<Media>;
}

export function SeriesGrid({ initialShows }: SeriesGridProps) {
  const searchParams = useSearchParams();
  const [shows, setShows] = useState<Media[]>(initialShows.results);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialShows.total_pages);

  const currentPage = useMemo(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  }, [searchParams]);

  useEffect(() => {
    // Only fetch if it's not the initial page load with initial data
    if (currentPage === 1 && shows === initialShows.results) {
        setShows(initialShows.results.map(s => ({ ...s, media_type: 'tv' })));
        setTotalPages(initialShows.total_pages);
        return;
    }

    setLoading(true);
    getPopularTvShows(currentPage)
      .then((data) => {
        const tvShowResults = data.results.map(t => ({...t, media_type: 'tv' as const}));
        setShows(tvShowResults);
        setTotalPages(data.total_pages);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, initialShows.results, initialShows.total_pages]);

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3]">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {shows.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
          <Paginator currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </>
  );
}
