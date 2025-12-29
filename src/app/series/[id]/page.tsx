
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { getImageUrl, getTvShowDetails, getTvShowVideos, getTvShowCredits } from '@/lib/tmdb';
import type { TVShowDetails, Video, Credits } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/star-rating';
import { TrailerModal } from '@/components/trailer-modal';
import { Separator } from '@/components/ui/separator';
import { SeasonSelector } from '@/components/season-selector';
import { CastCarousel } from '@/components/cast-carousel';

function formatRuntime(minutes: number[] | null) {
  if (!minutes || minutes.length === 0) return null;
  const avgMinutes = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  if (avgMinutes < 60) return `${Math.round(avgMinutes)}m/ep`;
  const hours = Math.floor(avgMinutes / 60);
  const mins = Math.round(avgMinutes % 60);
  return `${hours}h ${mins}m/ep`;
}

export default async function TVShowDetailPage({ params }: { params: { id: string } }) {
  const showDetails: TVShowDetails = await getTvShowDetails(params.id);
  const videos: Video[] = await getTvShowVideos(params.id);
  const credits: Credits = await getTvShowCredits(params.id);
  
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
  const firstSeasonNumber = showDetails.seasons.find(s => s.season_number > 0)?.season_number ?? 1;

  return (
    <div className="min-h-screen animate-fade-in-up">
      <div className="relative h-[80vh] w-full md:h-[95vh]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(showDetails.backdrop_path || showDetails.poster_path || '', 'original')}
            alt={showDetails.name}
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
                  src={getImageUrl(showDetails.poster_path || '', 'w780')}
                  alt={showDetails.name}
                  fill
                  className="rounded-lg object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end text-center md:col-span-2 md:text-left">
            <div className="flex flex-col space-y-2">
              <h1 className="font-headline text-3xl font-semibold md:text-5xl">{showDetails.name}</h1>
              {showDetails.tagline && <p className="text-md italic text-muted-foreground">{showDetails.tagline}</p>}
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
                <StarRating rating={showDetails.vote_average} />
                <span className="text-sm text-muted-foreground">{showDetails.first_air_date.substring(0, 4)}</span>
                <span className="text-sm text-muted-foreground">{showDetails.number_of_seasons} seasons</span>
                <span className="text-sm text-muted-foreground">{formatRuntime(showDetails.episode_run_time)}</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1 md:justify-start">
                {showDetails.genres.map(genre => (
                  <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                ))}
              </div>
            </div>

             <div className="flex w-full flex-col gap-4 pt-4 sm:w-auto sm:flex-row">
              <Link href={`/series/${showDetails.id}/play?s=${firstSeasonNumber}&e=1`} className="w-full">
                <Button size="lg" className="w-full rounded-[30px]">
                  <PlayCircle className="mr-2" />
                  Watch S{firstSeasonNumber} E1
                </Button>
              </Link>
              {trailer && <TrailerModal trailerKey={trailer.key} buttonClassName="rounded-[30px]" />}
            </div>
          </div>
        </div>

        <Separator className="my-8 md:my-12" />

        <div className="space-y-8">
            <div className="">
              <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
              <p className="mt-4 text-muted-foreground">{showDetails.overview}</p>
            </div>
            
            <CastCarousel cast={credits.cast} />

            <SeasonSelector showId={showDetails.id} seasons={showDetails.seasons} />
        </div>
      </div>
    </div>
  );
}
