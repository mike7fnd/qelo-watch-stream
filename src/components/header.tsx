'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Clapperboard, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useEffect } from 'react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('query') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
  };
  
  useEffect(() => {
    // If we navigate away from search, clear the input.
    if (pathname !== '/search') {
      setSearchQuery('');
    }
  }, [pathname]);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/40 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center space-x-2">
          <Clapperboard className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">QELO</span>
        </Link>
        <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md bg-muted pl-10"
              aria-label="Search"
            />
        </form>
      </div>
    </header>
  );
}
