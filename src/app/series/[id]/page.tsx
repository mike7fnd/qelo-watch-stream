
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Plus, Check } from 'lucide-react';
import { getImageUrl, getTvShowDetails, getTvShowVideos, getTvShowCredits, getMediaImages, getTvShowRecommendations } from '@/lib/tmdb';
import type { TVShowDetails, Video, Credits, Media } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TrailerModal } from '@/components/trailer-modal';
import { SeasonSelector } from '@/components/season-selector';
import { CastCarousel } from '@/components/cast-carousel';
import { MovieCarousel } from '@/components/movie-carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useMyList } from '@/hooks/use-my-list';
import { useParams } from 'next/navigation';
import { Youtube } from 'lucide-react';
import { StarRating } from '@/components/star-rating';

function formatRuntime(minutes: number[] | null) {
  if (!minutes || minutes.length === 0) return null;
  const avgMinutes = minutes.reduce((a, b) => a + b, 0) / minutes.length;
  if (avgMinutes < 60) return `${Math.round(avgMinutes)}m/ep`;
  const hours = Math.floor(avgMinutes / 60);
  const mins = Math.round(avgMinutes % 60);
  return `${hours}h ${mins}m/ep`;
}

const STREAMING_SERVICE_IDS = [8, 337, 9, 1899, 2552, 453, 56];

export default function TVShowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [showDetails, setShowDetails] = React.useState<TVShowDetails | null>(null);
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [credits, setCredits] = React.useState<Credits | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [recommendations, setRecommendations] = React.useState<Media[]>([]);
  const { addToList, removeFromList, isInList } = useMyList();

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const details = await getTvShowDetails(id);
        setShowDetails(details);

        const videoData = await getTvShowVideos(id);
        setVideos(videoData);

        const creditData = await getTvShowCredits(id);
        setCredits(creditData);

        const imageData = await getMediaImages(id, 'tv');
        const englishLogo = imageData.logos.find(l => l.iso_639_1 === 'en');
        const logoPath = englishLogo?.file_path || (imageData.logos.length > 0 ? imageData.logos[0].file_path : null);
        setLogoUrl(logoPath ? getImageUrl(logoPath, 'w500') : null);

        const recommendationsData = await getTvShowRecommendations(id);
        setRecommendations(recommendationsData.results.map(m => ({ ...m, media_type: 'tv' })));

      } catch (error) {
        console.error("Failed to fetch show data:", error);
      }
    };
    fetchData();
  }, [id]);

  if (!showDetails || !credits) {
    return null; // or a loading skeleton
  }

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
  const firstSeasonNumber = showDetails.seasons.find(s => s.season_number > 0)?.season_number ?? 1;
  const inList = isInList(showDetails.id);

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inList) {
      removeFromList(showDetails.id);
    } else {
      addToList({ ...showDetails, media_type: 'tv' });
    }
  };

  const streamingNetwork = showDetails.networks.find(n => STREAMING_SERVICE_IDS.includes(n.id)) || showDetails.networks.find(n => n.logo_path);


  return (
    <div className="min-h-screen animate-fade-in-up">
      <div className="relative h-screen w-full">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(showDetails.backdrop_path || showDetails.poster_path || '', 'original')}
            alt={showDetails.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 flex h-full items-end pb-10">
            <div className="container max-w-screen-2xl">
                {/* Desktop View */}
                <div className="hidden md:block max-w-lg">
                     {logoUrl ? (
                        <div className="relative h-40 mb-2">
                          <Image
                              src={logoUrl}
                              alt={showDetails.name}
                              fill
                              className="object-contain object-left"
                          />
                        </div>
                    ) : (
                        <h1 className="font-headline text-4xl font-semibold md:text-7xl text-shadow-lg mb-2">{showDetails.name}</h1>
                    )}
                    <div className="flex items-center gap-4 text-sm md:text-base">
                        {showDetails.genres[0] && <span>{showDetails.genres[0].name}</span>}
                        {showDetails.first_air_date && (
                            <>
                                <div className="h-4 w-px bg-white/30" />
                                <span>{showDetails.first_air_date.substring(0, 4)}</span>
                            </>
                        )}
                        {showDetails.number_of_seasons && (
                             <>
                                <div className="h-4 w-px bg-white/30" />
                                <span>{showDetails.number_of_seasons} Season{showDetails.number_of_seasons > 1 ? 's' : ''}</span>
                             </>
                        )}
                        {streamingNetwork?.logo_path && (
                            <>
                                <div className="h-4 w-px bg-white/30" />
                                <div className="relative h-4 w-12">
                                    <Image
                                        src={getImageUrl(streamingNetwork.logo_path, 'w300')}
                                        alt={streamingNetwork.name}
                                        fill
                                        className="object-contain object-left invert brightness-0"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                     <p className="pt-4 text-sm font-light text-white/80 line-clamp-3 md:text-base text-shadow-md">
                        {showDetails.overview}
                    </p>
                    <div className="flex items-center gap-3 pt-4">
                        <Link href={`/series/${showDetails.id}/play?s=${firstSeasonNumber}&e=1`} className="w-full max-w-[200px] md:w-auto">
                            <Button size="lg" className="w-full sm:w-auto rounded-[30px]">
                            <PlayCircle className="mr-2 h-5 w-5" />
                            <span>Watch S{firstSeasonNumber} E1</span>
                            </Button>
                        </Link>
                        {trailer && <TrailerModal trailerKey={trailer.key} buttonClassName="rounded-[30px] border-none bg-white/5 backdrop-blur-sm text-white hover:bg-white/10" />}
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-11 h-11 rounded-full border-none bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
                            onClick={handleToggleList}
                            aria-label="Add to My List"
                          >
                            {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="flex flex-col items-center justify-end md:hidden h-full pb-8">
                  {logoUrl ? (
                    <div className="relative w-full max-w-[280px] h-24 mb-2">
                      <Image src={logoUrl} alt={showDetails.name} fill className="object-contain" />
                    </div>
                  ) : (
                    <h1 className="font-semibold text-3xl text-shadow-lg text-center">{showDetails.name}</h1>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/80 mt-2">
                    {showDetails.genres[0] && <span>{showDetails.genres[0].name}</span>}
                    {showDetails.first_air_date && <span>| {showDetails.first_air_date.substring(0, 4)}</span>}
                    {showDetails.number_of_seasons > 0 && <span>| {showDetails.number_of_seasons} seasons</span>}
                     {streamingNetwork?.logo_path && (
                        <>
                           <span className="mx-1">|</span>
                           <div className="relative h-2 w-6">
                                <Image
                                    src={getImageUrl(streamingNetwork.logo_path, 'w300')}
                                    alt={streamingNetwork.name}
                                    fill
                                    className="object-contain object-left invert brightness-0"
                                />
                            </div>
                        </>
                     )}
                  </div>

                  <p className="pt-4 text-xs font-light text-white/80 line-clamp-3 text-center px-4">
                    {showDetails.overview}
                  </p>

                  <div className="flex w-full max-w-xs items-center gap-3 pt-4">
                      <Link href={`/series/${showDetails.id}/play?s=${firstSeasonNumber}&e=1`} className="w-full">
                          <Button size="lg" className="w-full rounded-[30px]">
                            <PlayCircle className="mr-2" />
                            Play
                          </Button>
                      </Link>
                      {trailer && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border-none">
                                    <Youtube />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-0 border-0">
                                <div className="aspect-video">
                                <iframe
                                    className="h-full w-full rounded-lg"
                                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                                </div>
                            </DialogContent>
                        </Dialog>
                      )}
                      <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 flex-shrink-0 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border-none"
                            onClick={handleToggleList}
                            aria-label="Add to My List"
                          >
                            {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </Button>
                  </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container max-w-screen-2xl py-12 space-y-12">
        <CastCarousel cast={credits.cast} />
        <SeasonSelector showId={showDetails.id} seasons={showDetails.seasons} />
        <MovieCarousel title="You May Also Like" movies={recommendations} />
      </div>
    </div>
  );
}
