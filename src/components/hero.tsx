
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Info, PlayCircle, Plus, Check } from 'lucide-react';
import type { Media } from '@/lib/types';
import { getImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { StarRating } from './star-rating';
import { useMyList } from '@/hooks/use-my-list';
import Autoplay from "embla-carousel-autoplay";

interface HeroProps {
  movies: Media[];
}

export function Hero({ movies }: HeroProps) {
  const { addToList, removeFromList, isInList } = useMyList();

  const getTitle = (movie: Media) => ('name' in movie ? movie.name : movie.title);
  const getReleaseDate = (movie: Media) => ('first_air_date' in movie ? movie.first_air_date : movie.release_date);
  const getLink = (movie: Media) => `/${movie.media_type === 'tv' ? 'series' : 'movie'}/${movie.id}`;

  return (
    <div className="w-full animate-fade-in-up md:pt-0 -mt-16 md:mt-0">
      <Carousel 
        opts={{ loop: true }} 
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
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
                <div className="relative h-[60vh] w-full md:h-screen">
                  <div className="absolute inset-0">
                    <Image
                      src={getImageUrl(movie.backdrop_path || movie.poster_path || '', 'original')}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-background md:via-background/70 md:to-transparent" />
                  </div>
                  <div className="relative z-10 flex h-full items-end pb-10">
                    <div className="container max-w-screen-2xl">
                      <div className="max-w-lg space-y-3 md:space-y-4 text-white">
                        <p className="font-bold uppercase tracking-widest text-primary text-shadow-lg">
                          {movie.media_type === 'tv' ? 'Series' : 'Movie'}
                        </p>
                        <h1 className="font-headline text-4xl font-semibold md:text-7xl text-shadow-lg">{title}</h1>
                        <div className="flex items-center gap-4 text-sm md:text-base">
                          <StarRating rating={movie.vote_average} className="text-white"/>
                          {releaseDate && <span>{releaseDate.substring(0, 4)}</span>}
                        </div>
                        <p className="text-sm text-white/80 line-clamp-3 md:text-base text-shadow-md">
                          {movie.overview}
                        </p>
                        <div className="flex items-center gap-3 pt-4">
                            <Link href={`${getLink(movie)}/play`}>
                                <Button size="lg" className="w-full sm:w-auto rounded-[30px]">
                                <PlayCircle className="mr-2 h-5 w-5" />
                                <span>Play</span>
                                </Button>
                            </Link>
                            <Link href={getLink(movie)}>
                                <Button variant="secondary" size="lg" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto rounded-[30px] border-none">
                                    <Info className="mr-2 h-5 w-5" />
                                    <span>More Info</span>
                                </Button>
                            </Link>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/20"
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
      </Carousel>
    </div>
  );
}
