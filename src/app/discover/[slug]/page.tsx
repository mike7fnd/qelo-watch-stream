
import { getDiscoverMedia, getDiscoverTitle } from '@/lib/discover';
import type { Media } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Header } from '@/components/header';
import { Paginator } from '@/components/paginator';

export default async function DiscoverPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const title = getDiscoverTitle(params.slug);
  const { results, total_pages } = await getDiscoverMedia(params.slug, page);

  return (
    <>
      <Header />
      <div className="container max-w-screen-2xl animate-fade-in-up py-8">
        <h1 className="mb-8 text-3xl font-bold">{title}</h1>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {results.map((item: Media) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
        <Paginator currentPage={page} totalPages={total_pages} />
      </div>
    </>
  );
}
