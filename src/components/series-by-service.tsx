
'use client';

import { useState, useEffect } from 'react';
import { getPopularTvShows, getMediaByProvider } from '@/lib/tmdb';
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
    { name: 'Max', id: '1899' },
    { name: 'Cartoon Network', id: '56' },
];

interface SeriesByServiceProps {
    initialShows: PaginatedResponse<Media>;
}

export function SeriesByService({ initialShows }: SeriesByServiceProps) {
  const [activeTab, setActiveTab] = useState('popular');
  const [shows, setShows] = useState<Media[]>(initialShows.results);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialShows.total_pages);

  useEffect(() => {
    setLoading(true);
    let promise;
    if (activeTab === 'popular') {
      promise = getPopularTvShows(currentPage);
    } else {
      promise = getMediaByProvider(activeTab, 'tv', currentPage);
    }

    promise.then((data) => {
        const showResults = data.results.map(m => ({...m, media_type: 'tv' as const}));
        setShows(showResults);
        setTotalPages(data.total_pages > 500 ? 500 : data.total_pages); // TMDB has a 500 page limit
    }).finally(() => {
        setLoading(false);
    });
  }, [activeTab, currentPage]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-6 mb-8">
        {services.map(service => (
          <TabsTrigger key={service.id} value={service.id}>{service.name}</TabsTrigger>
        ))}
      </TabsList>
      
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
            {shows.length > 0 && totalPages > 1 && (
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
