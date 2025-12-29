'use client';

import { useMyList } from '@/hooks/use-my-list';
import { MovieCard } from '@/components/movie-card';
import { Film } from 'lucide-react';
import { Header } from '@/components/header';

export default function MyListPage() {
  const { list } = useMyList();

  return (
    <>
      <Header />
      <div className="container max-w-screen-2xl py-8 animate-fade-in-up">
        <h1 className="mb-8 text-3xl font-bold">My List</h1>
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center h-96">
              <Film className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Your list is empty</h2>
              <p className="text-muted-foreground">Add movies and shows to your list to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {list.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
