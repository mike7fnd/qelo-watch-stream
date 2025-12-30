
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info, PlayCircle, Plus, Check, Star } from 'lucide-react';
import type { Media } from '@/lib/types';
import { getImageUrl, getMediaImages } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { StarRating } from './star-rating';
import { useMyList } from '@/hooks/use-my-list';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

interface HeroProps {
  movies: Media[];
}

export function Hero({ movies }: HeroProps) {
  const { addToList, removeFromList, isInList } = useMyList();
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [logos, setLogos] = React.useState<Record<number, string | null>>({});
  const autoplay = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  );

  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  React.useEffect(() => {
    const fetchLogos = async () => {
      const logoPromises = movies.map(async (movie) => {
        try {
          const images = await getMediaImages(movie.id, movie.media_type);
          const englishLogo = images.logos.find(l => l.iso_639_1 === 'en');
          const logoPath = englishLogo?.file_path || (images.logos.length > 0 ? images.logos[0].file_path : null);
          return { id: movie.id, logo: logoPath ? getImageUrl(logoPath, 'w500') : null };
        } catch (error) {
          console.error(`Failed to fetch logo for ${movie.id}:`, error);
          return { id: movie.id, logo: null };
        }
      });
      const logoResults = await Promise.all(logoPromises);
      const logosMap = logoResults.reduce((acc, { id, logo }) => {
        acc[id] = logo;
        return acc;
      }, {} as Record<number, string | null>);
      setLogos(logosMap);
    };

    if (movies.length > 0) {
      fetchLogos();
    }
  }, [movies]);

  const getTitle = (movie: Media) => ('name' in movie ? movie.name : movie.title);
  const getReleaseDate = (movie: Media) => ('first_air_date' in movie ? movie.first_air_date : movie.release_date);
  const getLink = (movie: Media) => `/${movie.media_type === 'tv' ? 'series' : 'movie'}/${movie.id}`;

  return (
    <div className="w-full animate-fade-in-up">
      <Carousel 
        setApi={setApi}
        opts={{ loop: true }} 
        plugins={[autoplay.current]}
        className="w-full"
      >
        <CarouselContent>
          {movies.map((movie) => {
            const title = getTitle(movie);
            const releaseDate = getReleaseDate(movie);
            const inList = isInList(movie.id);

            const handleToggleList = (e: React.MouseEvent) => {
              e.preventDefault();
              if (inList) {
                removeFromList(movie.id);
              } else {
                addToList(movie);
              }
            };

            return (
              <CarouselItem key={movie.id}>
                <div className="relative h-screen w-full">
                  <div className="absolute inset-0">
                    <Image
                      src={getImageUrl(movie.backdrop_path || movie.poster_path || '', 'original')}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                  </div>
                  <div className="relative z-10 flex h-full items-end pb-10">
                    <div className="container max-w-screen-2xl">
                      <div className="max-w-lg space-y-4 text-white">
                        
                        {/* Desktop view */}
                        <div className="hidden md:block space-y-4">
                            {logos[movie.id] ? (
                              <div className="relative h-40">
                                <Image
                                  src={logos[movie.id]!}
                                  alt={title}
                                  fill
                                  className="object-contain object-left"
                                />
                              </div>
                            ) : (
                              <h1 className="font-headline text-4xl font-semibold md:text-7xl text-shadow-lg">{title}</h1>
                            )}
                            <div className="flex items-center gap-4 text-sm md:text-base">
                                <StarRating rating={movie.vote_average} className="text-white"/>
                                {releaseDate && <span>{releaseDate.substring(0, 4)}</span>}
                            </div>
                            <p className="text-sm text-white/80 line-clamp-3 md:text-base text-shadow-md">
                                {movie.overview}
                            </p>
                        </div>
                        
                        {/* Mobile view */}
                        <div className="flex flex-col items-center justify-center space-y-2 text-center md:hidden">
                            {logos[movie.id] ? (
                              <div className="relative w-full max-w-[280px] h-24">
                                <Image
                                  src={logos[movie.id]!}
                                  alt={title}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <p className="font-semibold text-2xl text-shadow-lg">{title}</p>
                            )}
                             <div className="flex items-center gap-2 text-xs">
                                <span className="capitalize">{movie.media_type}</span>
                                {releaseDate && <span>&bull; {releaseDate.substring(0, 4)}</span>}
                                {movie.vote_average > 0 && <span>&bull; {(movie.vote_average / 2).toFixed(1)} <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" /></span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2 md:justify-start md:pt-4">
                            <Link href={`${getLink(movie)}/play`} className="w-full max-w-[150px] md:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-[30px]">
                                <PlayCircle className="mr-2 h-5 w-5" />
                                <span>Play</span>
                                </Button>
                            </Link>
                            
                            <Link href={getLink(movie)} className="hidden md:inline-flex">
                                <Button variant="secondary" size="lg" className="bg-white/5 backdrop-blur-sm hover:bg-white/10 w-full sm:w-auto rounded-[30px] border-none">
                                    <Info className="mr-2 h-5 w-5" />
                                    <span>More Info</span>
                                </Button>
                            </Link>

                            <Link href={getLink(movie)} className="md:hidden">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-11 h-11 rounded-full border-none bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
                                    aria-label="More Info"
                                >
                                    <Info className="h-5 w-5" />
                                </Button>
                            </Link>
                            
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
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          onMouseEnter={() => autoplay.current.stop()}
          onMouseLeave={() => autoplay.current.play()}
        >
            {movies.map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "h-1.5 w-1.5 rounded-full bg-white/50 transition-all",
                        i === current && "w-4 bg-white"
                    )}
                />
            ))}
        </div>
      </Carousel>
    </div>
  );
}
