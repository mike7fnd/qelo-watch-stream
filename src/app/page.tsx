import { Hero } from '@/components/hero';
import { MovieCarousel } from '@/components/movie-carousel';
import { StreamingServiceSelector } from '@/components/streaming-service-selector';
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getPopularTvShows, getTopRatedTvShows, getKdramas, getAnimatedShows, getNowPlayingMovies, getAnimatedMovies } from '@/lib/tmdb';
import type { Media } from '@/lib/types';

export default async function Home() {
  const popularMoviesData = getPopularMovies();
  const topRatedMoviesData = getTopRatedMovies();
  const upcomingMoviesData = getUpcomingMovies();
  const popularTvShowsData = getPopularTvShows();
  const topRatedTvShowsData = getTopRatedTvShows();
  const nowPlayingData = getNowPlayingMovies();
  const kdramasData = getKdramas();
  const animatedShowsData = getAnimatedShows();
  const animatedMoviesData = getAnimatedMovies();

  const [
    popularMovies, 
    topRatedMovies, 
    upcomingMovies, 
    popularTvShows, 
    topRatedTvShows,
    nowPlaying,
    kdramas,
    animatedShows,
    animatedMovies
  ] = await Promise.all([
    popularMoviesData,
    topRatedMoviesData,
    upcomingMoviesData,
    popularTvShowsData,
    topRatedTvShowsData,
    nowPlayingData,
    kdramasData,
    animatedShowsData,
    animatedMoviesData
  ]);
  
  const heroShows: Media[] = [...nowPlaying.results.slice(0, 5), ...popularTvShows.results.slice(0, 5)].map(show => ({
    ...show,
    title: 'name' in show ? show.name : show.title,
    release_date: 'first_air_date' in show ? show.first_air_date : show.release_date,
    media_type: 'name' in show ? 'tv' : 'movie',
  }));

  return (
    <div className="flex flex-col">
      {heroShows.length > 0 && <Hero movies={heroShows} />}
      <div className="container max-w-screen-2xl space-y-12 py-12">
        <MovieCarousel 
          title="New This Week" 
          movies={[...upcomingMovies.results, ...topRatedTvShows.results.slice(10,20)].sort((a,b) => b.popularity - a.popularity).map(m => ({...m, media_type: 'name' in m ? 'tv' : 'movie'}))} 
          href="/discover/new-this-week"
          className="opacity-0" 
          style={{ animationDelay: '200ms'}} 
        />
        <MovieCarousel 
          title="Trending Now" 
          movies={[...popularMovies.results, ...popularTvShows.results].sort((a,b) => b.popularity - a.popularity).map(m => ({...m, media_type: 'name' in m ? 'tv' : 'movie'}))}
          href="/discover/trending-now"
          className="opacity-0" 
          style={{ animationDelay: '300ms'}} 
        />
        <StreamingServiceSelector className="opacity-0" style={{ animationDelay: '400ms'}} />
        <MovieCarousel 
          title="Top Rated Movies"
          movies={topRatedMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/top-rated-movies"
          className="opacity-0"
          style={{ animationDelay: '500ms'}}
        />
        <MovieCarousel 
          title="Top Rated TV Shows"
          movies={topRatedTvShows.results.map(m => ({...m, media_type: 'tv'}))}
          href="/discover/top-rated-tv-shows"
          className="opacity-0"
          style={{ animationDelay: '600ms'}}
        />
        <MovieCarousel 
          title="K-Dramas" 
          movies={kdramas.results.map(m => ({...m, media_type: 'tv'}))}
          href="/discover/k-dramas"
          className="opacity-0" 
          style={{ animationDelay: '700ms'}} 
        />
        <MovieCarousel 
          title="Cartoon Movies"
          movies={animatedMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/cartoon-movies"
          className="opacity-0"
          style={{ animationDelay: '800ms'}}
        />
        <MovieCarousel 
          title="Animated Shows" 
          movies={animatedShows.results.map(m => ({...m, media_type: 'tv'}))}
          href="/discover/animated-shows"
          className="opacity-0" 
          style={{ animationDelay: '900ms'}} 
        />
      </div>
    </div>
  );
}
