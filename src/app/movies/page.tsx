
import { getPopularMovies } from '@/lib/tmdb';
import type { Media } from '@/lib/types';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { PageSearchBar } from '@/components/page-search-bar';
import { MoviesByService } from '@/components/movies-by-service';

export default async function MoviesPage() {
  const popularMovies = await getPopularMovies(1);

  const heroMovies: Media[] = popularMovies.results.slice(0, 10).map(movie => ({
    ...movie,
    media_type: 'movie',
  }));

  return (
    <>
      <Header />
      <Hero movies={heroMovies} />
      <div className="container max-w-screen-2xl animate-fade-in-up py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Movies</h1>
          <PageSearchBar />
        </div>
        <MoviesByService initialMovies={popularMovies} />
      </div>
    </>
  );
}
