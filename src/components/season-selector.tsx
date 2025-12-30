'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Star } from 'lucide-react';
import type { Season, Episode, SeasonDetails } from '@/lib/types';
import { getTvShowSeasonDetails, getImageUrl } from '@/lib/tmdb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';

interface SeasonSelectorProps {
  showId: number;
  seasons: Season[];
}

function EpisodeCard({ showId, seasonNumber, episode }: { showId: number, seasonNumber: number, episode: Episode }) {
    return (
        <Card className="overflow-hidden flex flex-col md:flex-row items-start group">
            <div className="relative w-full md:w-1/3 aspect-video flex-shrink-0">
                <Image
                    src={getImageUrl(episode.still_path || '', 'w500')}
                    alt={episode.name}
                    fill
                    className="object-cover"
                />
                <Link href={`/series/${showId}/play?s=${seasonNumber}&e=${episode.episode_number}`} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-12 w-12 text-white" />
                </Link>
            </div>
            <div className="p-4 flex flex-col justify-between h-full">
                <div>
                    <h3 className="font-semibold text-sm md:text-base">
                        <Link href={`/series/${showId}/play?s=${seasonNumber}&e=${episode.episode_number}`} className="hover:text-primary">
                            E{episode.episode_number}: {episode.name}
                        </Link>
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2">{episode.overview}</p>
                </div>
                <div className="flex items-center gap-4 text-xs mt-2 text-muted-foreground">
                    {episode.air_date && <span>{episode.air_date}</span>}
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{episode.vote_average.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function EpisodeListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                 <Card key={i} className="overflow-hidden flex flex-col md:flex-row items-start">
                    <div className="relative w-full md:w-1/3 aspect-video flex-shrink-0">
                        <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4 w-full">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-1" />
                        <Skeleton className="h-4 w-1/2 mt-4" />
                    </div>
                </Card>
            ))}
        </div>
    )
}

export function SeasonSelector({ showId, seasons }: SeasonSelectorProps) {
  const availableSeasons = seasons.filter(s => s.season_number > 0 && s.episode_count > 0);
  const [selectedSeason, setSelectedSeason] = useState<number>(availableSeasons[0]?.season_number ?? 1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasonDetails() {
      if (!selectedSeason) return;
      setLoading(true);
      try {
        const details = await getTvShowSeasonDetails(showId, selectedSeason);
        setSeasonDetails(details);
      } catch (error) {
        console.error("Failed to fetch season details:", error);
        setSeasonDetails(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSeasonDetails();
  }, [showId, selectedSeason]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Episodes</h2>
            {availableSeasons.length > 1 && (
                <Select
                    value={String(selectedSeason)}
                    onValueChange={(value) => setSelectedSeason(Number(value))}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a season" />
                    </SelectTrigger>
                    <SelectContent>
                    {availableSeasons.map(season => (
                        <SelectItem key={season.id} value={String(season.season_number)}>
                        {season.name} ({season.episode_count} episodes)
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            )}
        </div>

        {loading && <EpisodeListSkeleton />}
        {!loading && seasonDetails && (
            <div className="grid grid-cols-1 gap-4">
                {seasonDetails.episodes.map(episode => (
                    <EpisodeCard key={episode.id} showId={showId} seasonNumber={selectedSeason} episode={episode} />
                ))}
            </div>
        )}
    </div>
  );
}
