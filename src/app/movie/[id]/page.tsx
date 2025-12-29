
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { getImageUrl, getMovieDetails, getMovieVideos, getMovieCredits, getMovieRecommendations } from '@/lib/tmdb';
import type { MovieDetails as MovieDetailsType, Video, Credits } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/star-rating';
import { TrailerModal } from '@/components/trailer-modal';
import { Separator } from '@/components/ui/separator';
import { CastCarousel } from '@/components/cast-carousel';
import { MovieCarousel } from '@/components/movie-carousel';

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const movieDetailsData = getMovieDetails(params.id);
  const videosData = getMovieVideos(params.id);
  const creditsData = getMovieCredits(params.id);
  const recommendationsData = getMovieRecommendations(params.id);

  const [movieDetails, videos, credits, recommendations]: [MovieDetailsType, Video[], Credits, any] = await Promise.all([
    movieDetailsData,
    videosData,
    creditsData,
    recommendationsData
  ]);
  
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
  const recommendedMovies = recommendations.results.map((m: any) => ({...m, media_type: 'movie' as const}));

  return (
    <div className="min-h-screen animate-fade-in-up">
      <div className="relative h-[80vh] w-full md:h-[95vh]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(movieDetails.backdrop_path || movieDetails.poster_path || '', 'original')}
            alt={movieDetails.title}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <div className="container relative z-10 -mt-[45vh] max-w-screen-2xl pb-16 md:-mt-[50vh] xl:-mt-[40vh]">
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-3 md:gap-12">
          <div className="flex justify-center md:col-span-1 md:row-start-1">
             <div className="w-1/2 max-w-[200px] flex-shrink-0 md:w-full md:max-w-none">
              <div className="aspect-[2/3] relative">
                <Image
                  src={getImageUrl(movieDetails.poster_path || '', 'w780')}
                  alt={movieDetails.title}
                  fill
                  className="rounded-lg object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end text-center md:col-span-2 md:text-left">
            <div className="flex flex-col space-y-2">
              <h1 className="font-headline text-3xl font-semibold md:text-5xl">{movieDetails.title}</h1>
              {movieDetails.tagline && <p className="text-md italic text-muted-foreground">{movieDetails.tagline}</p>}
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
                <StarRating rating={movieDetails.vote_average} />
                <span className="text-sm text-muted-foreground">{movieDetails.release_date.substring(0, 4)}</span>
                <span className="text-sm text-muted-foreground">{formatRuntime(movieDetails.runtime)}</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1 md:justify-start">
                {movieDetails.genres.map(genre => (
                  <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                ))}
              </div>
            </div>

             <div className="flex w-full flex-col gap-4 pt-4 sm:w-auto sm:flex-row">
              <Link href={`/movie/${movieDetails.id}/play`} className="w-full">
                <Button size="lg" className="w-full rounded-[30px]">
                  <PlayCircle className="mr-2" />
                  Watch Now
                </Button>
              </Link>
              {trailer && <TrailerModal trailerKey={trailer.key} buttonClassName="rounded-[30px]" />}
            </div>
          </div>
        </div>

        <Separator className="my-8 md:my-12" />

        <div className="space-y-12">
            <div className="">
                <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
                <p className="mt-4 text-muted-foreground">{movieDetails.overview}</p>
            </div>
            <CastCarousel cast={credits.cast} />
            <MovieCarousel title="You May Like" movies={recommendedMovies} />
        </div>

      </div>
    </div>
  );
}
