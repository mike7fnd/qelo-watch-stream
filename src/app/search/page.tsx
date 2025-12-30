
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchMovies, searchTvShows } from '@/lib/tmdb';
import type { Media } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paginator } from '@/components/paginator';

const MAX_HISTORY = 8;

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('qelo-search-history') || '[]');
      setSearchHistory(history);
    } catch (e) {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    if (query) {
      setLoading(true);

      try {
        let history = JSON.parse(localStorage.getItem('qelo-search-history') || '[]');
        history = [query, ...history.filter((h: string) => h !== query)].slice(0, MAX_HISTORY);
        localStorage.setItem('qelo-search-history', JSON.stringify(history));
        setSearchHistory(history);
      } catch (e) {
        // ignore
      }


      Promise.all([
        searchMovies(query, page),
        searchTvShows(query, page),
      ]).then(([movies, tvShows]) => {
        const movieResults = movies.results.map(m => ({...m, media_type: 'movie' as const}));
        const tvShowResults = tvShows.results.map(t => ({...t, media_type: 'tv' as const}));
        setResults([...movieResults, ...tvShowResults].sort((a, b) => b.popularity - a.popularity));
        setTotalPages(Math.max(movies.total_pages, tvShows.total_pages));
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, page]);

  const handleHistoryClick = (item: string) => {
    router.push(`/search?query=${encodeURIComponent(item)}`);
  };

  if (loading) {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-[2/3]">
                    <Skeleton className="h-full w-full rounded-[15px]" />
                </div>
            ))}
        </div>
    );
  }
  
  if (!query) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        {searchHistory.length === 0 ? (
            <>
                <SearchIcon className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Find your next favorite movie or show</h2>
                <p className="text-muted-foreground">Use the search bar above to get started.</p>
            </>
        ) : (
          <div className="w-full max-w-md">
            <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-muted-foreground">
              <History className="h-5 w-5" /> Recent Searches
            </h3>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {searchHistory.map((item) => (
                <Button key={item} variant="outline" size="sm" onClick={() => handleHistoryClick(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <>
        <h1 className="mb-8 text-3xl font-bold">Results for "{query}"</h1>
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
            <SearchIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">No results found</h2>
            <p className="text-muted-foreground">Try a different search term.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Results for "{query}"</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {results.map(item => (
          <MovieCard key={`${item.media_type}-${item.id}`} movie={item} />
        ))}
      </div>
      <Paginator currentPage={page} totalPages={totalPages} />
    </>
  );
}

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
      router.push(`/search?${params.toString()}`);
    } else {
      router.push('/search');
    }
  };

  useEffect(() => {
    // Sync input with URL param
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  return (
    <form onSubmit={handleSearch} className="relative mx-auto mb-8 w-full max-w-xl mt-12">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Search for movies, TV shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full rounded-[30px] bg-muted pl-10 text-base"
          aria-label="Search"
        />
    </form>
  )
}

export default function SearchPage() {
    return (
        <>
            
            <div className="container max-w-screen-2xl py-8">
                <Suspense>
                    <SearchBar />
                    <SearchResults />
                </Suspense>
            </div>
        </>
    );
}
