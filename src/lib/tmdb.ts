import type { Movie, MovieDetails, PaginatedResponse, TVShow, TVShowDetails, Video, SeasonDetails, Credits, MediaImageResponse } from '@/lib/types';

const API_KEY = '9de9190cc0054e4675cbd4571c5ec33a';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZGU5MTkwY2MwMDU0ZTQ2NzVjYmQ0NTcxYzVlYzMzYSIsIm5iZiI6MTc2Njk3NDExNS45ODMsInN1YiI6IjY5NTFlMmEzODM0NTgwZmM5OWU0MTI5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lMH8q8j1kFc22kCTBb6Vg3pWd6m8rQXPgixlObmR8BQ`
  }
};

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error('Failed to fetch data from TMDB');
    }
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Movies
export const getNowPlayingMovies = () => fetchFromTMDB<PaginatedResponse<Movie>>('movie/now_playing');
export const getPopularMovies = () => fetchFromTMDB<PaginatedResponse<Movie>>('movie/popular');
export const getTopRatedMovies = () => fetchFromTMDB<PaginatedResponse<Movie>>('movie/top_rated');
export const getUpcomingMovies = () => fetchFromTMDB<PaginatedResponse<Movie>>('movie/upcoming');
export const getAnimatedMovies = () => fetchFromTMDB<PaginatedResponse<Movie>>('discover/movie', { with_genres: '16', sort_by: 'popularity.desc' });
export const getMovieDetails = (id: string | number) => fetchFromTMDB<MovieDetails>(`movie/${id}`);
export const getMovieVideos = async (id: string | number): Promise<Video[]> => {
  const data = await fetchFromTMDB<{ results: Video[] }>(`movie/${id}/videos`);
  return data.results;
};
export const getMovieCredits = (id: string | number) => fetchFromTMDB<Credits>(`movie/${id}/credits`);
export const searchMovies = (query: string) => fetchFromTMDB<PaginatedResponse<Movie>>('search/movie', { query });


// TV Shows
export const getPopularTvShows = () => fetchFromTMDB<PaginatedResponse<TVShow>>('tv/popular');
export const getTopRatedTvShows = () => fetchFromTMDB<PaginatedResponse<TVShow>>('tv/top_rated');
export const getOnTheAirTvShows = () => fetchFromTMDB<PaginatedResponse<TVShow>>('tv/on_the_air');
export const getNetflixPopularShows = () => fetchFromTMDB<PaginatedResponse<TVShow>>('discover/tv', { with_networks: '213' });
export const getKdramas = () => fetchFromTMDB<PaginatedResponse<TVShow>>('discover/tv', { with_origin_country: 'KR', language: 'en-US', sort_by: 'popularity.desc' });
export const getAnimatedShows = () => fetchFromTMDB<PaginatedResponse<TVShow>>('discover/tv', { with_genres: '16', sort_by: 'popularity.desc' });


export const getTvShowDetails = (id: string | number) => fetchFromTMDB<TVShowDetails>(`tv/${id}`);
export const getTvShowVideos = async (id: string | number): Promise<Video[]> => {
  const data = await fetchFromTMDB<{ results: Video[] }>(`tv/${id}/videos`);
  return data.results;
};
export const getTvShowCredits = (id: string | number) => fetchFromTMDB<Credits>(`tv/${id}/credits`);
export const searchTvShows = (query: string) => fetchFromTMDB<PaginatedResponse<TVShow>>('search/tv', { query });
export const getTvShowSeasonDetails = (id: string | number, seasonNumber: number) => fetchFromTMDB<SeasonDetails>(`tv/${id}/season/${seasonNumber}`);


// Common
export const getImageUrl = (path: string, size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}${size}${path}`;
};

export const getMediaImages = (id: string | number, type: 'movie' | 'tv') => fetchFromTMDB<MediaImageResponse>(`${type}/${id}/images`);
