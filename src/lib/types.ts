export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
  genre_ids: number[];
  media_type?: 'movie';
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  media_type?: 'tv';
}

export interface Season {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface Episode {
  air_date: string | null;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface TVShowDetails extends TVShow {
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  tagline: string | null;
  networks: { id: number; name: string; logo_path: string; origin_country: string }[];
  number_of_seasons: number;
  seasons: Season[];
}

export type Media = Movie | TVShow;

export type MediaDetails = MovieDetails | TVShowDetails;

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: "YouTube";
  size: number;
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes" | "Bloopers";
  official: boolean;
  published_at: string;
  id: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Credits {
  cast: CastMember[];
  crew: any[]; // Not focusing on crew for now
}
