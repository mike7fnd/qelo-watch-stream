
import { Hero } from '@/components/hero';
import { MovieCarousel } from '@/components/movie-carousel';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getUpcomingMovies, 
  getPopularTvShows, 
  getTopRatedTvShows, 
  getKdramas, 
  getAnimatedShows, 
  getNowPlayingMovies, 
  getAnimatedMovies,
  getActionMovies,
  getComedyMovies,
  getHorrorMovies,
  getThrillerMovies,
  getSciFiFantasyMovies,
  getMediaByProvider,
} from '@/lib/tmdb';
import type { Media } from '@/lib/types';
import { ContinueWatching } from '@/components/continue-watching';

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
  const actionMoviesData = getActionMovies();
  const comedyMoviesData = getComedyMovies();
  const horrorMoviesData = getHorrorMovies();
  const thrillerMoviesData = getThrillerMovies();
  const scifiFantasyMoviesData = getSciFiFantasyMovies();
  const netflixMoviesData = getMediaByProvider('8', 'movie');
  const netflixShowsData = getMediaByProvider('8', 'tv');


  const [
    popularMovies, 
    topRatedMovies, 
    upcomingMovies, 
    popularTvShows, 
    topRatedTvShows,
    nowPlaying,
    kdramas,
    animatedShows,
    animatedMovies,
    actionMovies,
    comedyMovies,
    horrorMovies,
    thrillerMovies,
    scifiFantasyMovies,
    netflixMovies,
    netflixShows,
  ] = await Promise.all([
    popularMoviesData,
    topRatedMoviesData,
    upcomingMoviesData,
    popularTvShowsData,
    topRatedTvShowsData,
    nowPlayingData,
    kdramasData,
    animatedShowsData,
    animatedMoviesData,
    actionMoviesData,
    comedyMoviesData,
    horrorMoviesData,
    thrillerMoviesData,
    scifiFantasyMoviesData,
    netflixMoviesData,
    netflixShowsData,
  ]);
  
  const heroShows: Media[] = [...netflixMovies.results, ...netflixShows.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10)
    .map(show => ({
      ...show,
      title: 'name' in show ? show.name : show.title,
      release_date: 'first_air_date' in show ? show.first_air_date : show.release_date,
      media_type: 'name' in show ? 'tv' : 'movie',
  }));

  return (
    <div className="flex flex-col">
      {heroShows.length > 0 && <Hero movies={heroShows} />}
      <div className="container max-w-screen-2xl space-y-12 py-12">
        <ContinueWatching />
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
        <MovieCarousel 
          title="Action Movies"
          movies={actionMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/action-movies"
          className="opacity-0"
          style={{ animationDelay: '400ms'}}
        />
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
          title="Comedy Movies"
          movies={comedyMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/comedy-movies"
          className="opacity-0"
          style={{ animationDelay: '800ms'}}
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
        <MovieCarousel 
          title="Horror Movies"
          movies={horrorMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/horror-movies"
          className="opacity-0"
          style={{ animationDelay: '1000ms'}}
        />
        <MovieCarousel 
          title="Thrillers"
          movies={thrillerMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/thriller-movies"
          className="opacity-0"
          style={{ animationDelay: '1100ms'}}
        />
        <MovieCarousel 
          title="Sci-Fi & Fantasy"
          movies={scifiFantasyMovies.results.map(m => ({...m, media_type: 'movie'}))}
          href="/discover/sci-fi-fantasy"
          className="opacity-0"
          style={{ animationDelay: '1200ms'}}
        />
      </div>
    </div>
  );
}
