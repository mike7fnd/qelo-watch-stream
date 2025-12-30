'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PageSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('query') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('query', searchQuery.trim());
      router.push(`/search?${params.toString()}`);
    } else {
      router.push('/search');
    }
  };

  useEffect(() => {
    // Sync input with URL param if user lands on search page directly
    const query = searchParams.get('query');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-[30px] bg-muted pl-10 text-base"
          aria-label="Search"
        />
    </form>
  )
}
