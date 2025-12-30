
import {
  getPopularMovies,
  getPopularTvShows,
  getUpcomingMovies,
  getTopRatedTvShows,
  getKdramas,
  getAnimatedMovies,
  getAnimatedShows,
  getTopRatedMovies,
  getMediaByProvider,
} from './tmdb';
import type { Media, PaginatedResponse } from './types';

interface DiscoverCategory {
  title: string;
  fetcher: (page: number) => Promise<PaginatedResponse<Media>>;
}

const services: Record<string, string> = {
  '8': 'Netflix',
  '337': 'Disney+',
  '9': 'Amazon Prime Video',
  '453': 'Hulu',
  '1899': 'Max',
  '2552': 'Apple TV+',
};

const discoverCategories: Record<string, DiscoverCategory> = {
  'trending-now': {
    title: 'Trending Now',
    fetcher: async (page: number) => {
      const [movies, shows] = await Promise.all([
        getPopularMovies(page),
        getPopularTvShows(page),
      ]);
      const combined = [...movies.results, ...shows.results]
        .sort((a, b) => b.popularity - a.popularity)
        .map(m => ({ ...m, media_type: 'name' in m ? 'tv' : 'movie' } as Media));
      
      return {
        page: movies.page,
        results: combined,
        total_pages: Math.min(movies.total_pages, shows.total_pages),
        total_results: movies.total_results + shows.total_results,
      };
    },
  },
  'new-this-week': {
    title: 'New This Week',
    fetcher: async (page: number) => {
        const [movies, shows] = await Promise.all([
            getUpcomingMovies(page),
            getTopRatedTvShows(page),
        ]);
        const combined = [...movies.results, ...shows.results]
            .sort((a, b) => b.popularity - a.popularity)
            .map(m => ({ ...m, media_type: 'name' in m ? 'tv' : 'movie' } as Media));
        
        return {
            page: movies.page,
            results: combined,
            total_pages: Math.min(movies.total_pages, shows.total_pages),
            total_results: movies.total_results + shows.total_results,
        };
    },
  },
  'k-dramas': {
    title: 'K-Dramas',
    fetcher: async (page: number) => {
      const shows = await getKdramas(page);
      return {
        ...shows,
        results: shows.results.map(s => ({ ...s, media_type: 'tv' })),
      };
    },
  },
  'cartoon-movies': {
    title: 'Cartoon Movies',
    fetcher: async (page: number) => {
        const movies = await getAnimatedMovies(page);
        return {
            ...movies,
            results: movies.results.map(m => ({ ...m, media_type: 'movie' })),
        };
    },
  },
  'animated-shows': {
    title: 'Animated Shows',
    fetcher: async (page: number) => {
        const shows = await getAnimatedShows(page);
        return {
            ...shows,
            results: shows.results.map(s => ({ ...s, media_type: 'tv' })),
        };
    },
  },
  'top-rated-movies': {
    title: 'Top Rated Movies',
    fetcher: async (page: number) => {
      const movies = await getTopRatedMovies(page);
      return {
        ...movies,
        results: movies.results.map(m => ({ ...m, media_type: 'movie' })),
      };
    }
  },
  'top-rated-tv-shows': {
    title: 'Top Rated TV Shows',
    fetcher: async (page: number) => {
      const shows = await getTopRatedTvShows(page);
      return {
        ...shows,
        results: shows.results.map(s => ({ ...s, media_type: 'tv' })),
      };
    }
  },
};

Object.keys(services).forEach(serviceId => {
    discoverCategories[serviceId] = {
        title: `Available on ${services[serviceId]}`,
        fetcher: async (page: number) => {
            const [movies, shows] = await Promise.all([
                getMediaByProvider(serviceId, 'movie', page),
                getMediaByProvider(serviceId, 'tv', page)
            ]);

            const combined = [...movies.results, ...shows.results]
                .sort((a,b) => b.popularity - a.popularity)
                .map(m => ({ ...m, media_type: 'name' in m ? 'tv' : 'movie' } as Media));

            return {
                page: movies.page,
                results: combined,
                total_pages: Math.min(movies.total_pages, shows.total_pages),
                total_results: movies.total_results + shows.total_results
            }
        }
    }
})

export function getDiscoverTitle(slug: string): string {
  return discoverCategories[slug]?.title || 'Discover';
}

export function getDiscoverMedia(slug: string, page: number = 1): Promise<PaginatedResponse<Media>> {
  const category = discoverCategories[slug];
  if (!category) {
    throw new Error(`Category not found: ${slug}`);
  }
  return category.fetcher(page);
}
