
import { getPopularTvShows } from '@/lib/tmdb';
import type { Media } from '@/lib/types';

import { Hero } from '@/components/hero';
import { SeriesByService } from '@/components/series-by-service';
import { PageSearchBar } from '@/components/page-search-bar';

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const popularTvShows = await getPopularTvShows(page);

  const heroShows: Media[] = popularTvShows.results.slice(0, 10).map(show => ({
    ...show,
    media_type: 'tv',
  }));

  return (
    <>
      
      <Hero movies={heroShows} />
      <div className="container max-w-screen-2xl animate-fade-in-up py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">TV Shows</h1>
          <PageSearchBar />
        </div>
        <SeriesByService initialShows={popularTvShows} />
      </div>
    </>
  );
}
