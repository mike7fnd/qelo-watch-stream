
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPopularMovies, getMediaByProvider } from '@/lib/tmdb';
import type { Media, PaginatedResponse } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Paginator } from '@/components/paginator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const services = [
    { name: 'Popular', id: 'popular' },
    { name: 'Netflix', id: '8' },
    { name: 'Disney+', id: '337' },
    { name: 'Prime Video', id: '9' },
    { name: 'Hulu', id: '453' },
    { name: 'Max', id: '1899' },
    { name: 'Apple TV+', id: '2552' },
];

interface MoviesByServiceProps {
    initialMovies: PaginatedResponse<Media>;
}

export function MoviesByService({ initialMovies }: MoviesByServiceProps) {
  const searchParams = useSearchParams();
  const pageFromUrl = searchParams.get('page');
  const initialPage = pageFromUrl ? Number(pageFromUrl) : 1;
  
  const [activeTab, setActiveTab] = useState('popular');
  const [movies, setMovies] = useState<Media[]>(initialMovies.results);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialMovies.total_pages);

  useEffect(() => {
    const newPage = pageFromUrl ? Number(pageFromUrl) : 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [pageFromUrl, currentPage]);

  useEffect(() => {
    // Don't fetch if it's the first page and we have initial data.
    if (currentPage === 1 && activeTab === 'popular' && movies === initialMovies.results) {
        return;
    }
    
    setLoading(true);
    let promise;
    if (activeTab === 'popular') {
      promise = getPopularMovies(currentPage);
    } else {
      promise = getMediaByProvider(activeTab, 'movie', currentPage);
    }

    promise.then((data) => {
        const movieResults = data.results.map(m => ({...m, media_type: 'movie' as const}));
        setMovies(movieResults);
        setTotalPages(data.total_pages > 500 ? 500 : data.total_pages); // TMDB has a 500 page limit
    }).finally(() => {
        setLoading(false);
    });
  }, [activeTab, currentPage, initialMovies.results]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page on tab change
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-8">
        {services.map(service => (
          <TabsTrigger key={service.id} value={service.id}>{service.name}</TabsTrigger>
        ))}
      </TabsList>
      
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-[2/3]">
                <Skeleton className="h-full w-full rounded-[15px]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {movies.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
            {movies.length > 0 && totalPages > 1 && (
                <Paginator 
                    currentPage={currentPage} 
                    totalPages={totalPages}
                />
            )}
          </>
        )}
    </Tabs>
  );
}
