
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getPersonDetails, getPersonCombinedCredits, getPersonImages, getImageUrl } from '@/lib/tmdb';
import type { PersonDetails, PersonCombinedCredits, PersonImages, Media } from '@/lib/types';
import { MovieCarousel } from '@/components/movie-carousel';

import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, MapPin, BookText, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

function PersonPageSkeleton() {
  return (
    <div className="container mx-auto max-w-screen-2xl p-4 md:p-8 animate-pulse">
        <div className="grid grid-cols-1 gap-8 pt-20 md:grid-cols-3">
            <div className="flex flex-col items-center md:items-start">
                <Skeleton className="h-[450px] w-[300px] rounded-lg" />
            </div>
            <div className="md:col-span-2">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <Skeleton className="h-10 w-32 rounded-md" />
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            </div>
        </div>
        <div className="mt-12 space-y-12">
            <div>
                <Skeleton className="h-8 w-1/4 mb-4 rounded-lg" />
                <div className="flex space-x-4">
                    {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="w-1/2 flex-shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 2xl:w-[14.28%]">
                        <div className="aspect-[2/3]">
                            <Skeleton className="h-full w-full rounded-[15px]" />
                        </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-8 w-1/4 mb-4 rounded-lg" />
                <div className="flex space-x-4">
                     {Array.from({ length: 7 }).map((_, j) => (
                        <div key={j} className="w-1/2 flex-shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 2xl:w-[14.28%]">
                        <div className="aspect-[2/3]">
                            <Skeleton className="h-full w-full rounded-[15px]" />
                        </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

// Simple in-memory cache
const cache = new Map<string, any>();


export default function PersonPage() {
  const params = useParams();
  const id = params.id as string;
  const [person, setPerson] = useState<PersonDetails | null>(() => cache.get(`person_${id}_details`));
  const [credits, setCredits] = useState<PersonCombinedCredits | null>(() => cache.get(`person_${id}_credits`));
  const [images, setImages] = useState<PersonImages | null>(() => cache.get(`person_${id}_images`));
  const [loading, setLoading] = useState(!person);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      if (cache.has(`person_${id}_details`)) {
        return;
      }
      try {
        setLoading(true);
        const personData = await getPersonDetails(id);
        setPerson(personData);
        cache.set(`person_${id}_details`, personData);

        const creditsData = await getPersonCombinedCredits(id);
        setCredits(creditsData);
        cache.set(`person_${id}_credits`, creditsData);

        const imagesData = await getPersonImages(id);
        setImages(imagesData);
        cache.set(`person_${id}_images`, imagesData);

      } catch (error) {
        console.error("Failed to fetch person data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading || !person || !credits || !images) {
    return (
        <>
            
            <BackButton />
            <PersonPageSkeleton />
        </>
    );
  }

  const movies = credits.cast.filter(item => item.media_type === 'movie') as Media[];
  const tvShows = credits.cast.filter(item => item.media_type === 'tv') as Media[];

  const age = person.birthday && !person.deathday
    ? new Date().getFullYear() - new Date(person.birthday).getFullYear()
    : null;

  return (
    <>
        
        <BackButton />
        <div className="container mx-auto max-w-screen-2xl p-4 md:p-8 animate-fade-in-up">
        <div className="grid grid-cols-1 gap-8 pt-20 md:grid-cols-3">
            <div className="flex flex-col items-center md:items-start">
            {person.profile_path ? (
                <Image
                src={getImageUrl(person.profile_path, 'original')}
                alt={person.name}
                width={300}
                height={450}
                className="rounded-lg shadow-2xl object-cover h-[450px] w-[300px]"
                />
            ) : (
                <div className="flex h-80 w-80 items-center justify-center rounded-lg bg-muted shadow-lg">
                <User className="h-40 w-40 text-muted-foreground" />
                </div>
            )}
            </div>
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold md:text-6xl">{person.name}</h1>
              <div className="mt-4 flex flex-col gap-2 text-muted-foreground">
                  {person.birthday && (
                      <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                          {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {age && ` (age ${age})`}
                          {person.deathday && ` - ${new Date(person.deathday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                      </span>
                      </div>
                  )}
                  {person.place_of_birth && (
                      <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{person.place_of_birth}</span>
                      </div>
                  )}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!person.biography}>
                        <BookText className="mr-2 h-4 w-4" />
                        Biography
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Biography of {person.name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <p className="text-muted-foreground text-base font-light leading-relaxed">
                          {person.biography}
                      </p>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={images.profiles.length === 0}>
                        <Images className="mr-2 h-4 w-4" />
                        Photos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Photos of {person.name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[70vh]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                      {images.profiles.map((image, index) => (
                          <Card key={index} className="overflow-hidden rounded-lg">
                              <CardContent className="p-0">
                                  <Image
                                  src={getImageUrl(image.file_path, 'w300')}
                                  alt={`${person.name} photo ${index + 1}`}
                                  width={200}
                                  height={300}
                                  className="aspect-[2/3] object-cover w-full"
                                  />
                              </CardContent>
                          </Card>
                      ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
        </div>

        <div className="mt-12 space-y-12">
            <MovieCarousel title="Known For (Movies)" movies={movies} />
            <MovieCarousel title="Known For (TV Shows)" movies={tvShows} />
        </div>
        </div>
    </>
  );
}
