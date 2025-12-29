'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Search, Tv, List, Clapperboard, Film, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Input } from './ui/input';
import React from 'react';

const mainNavItems = [
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/', icon: Home, label: 'Home' },
  { href: '/series', icon: Tv, label: 'TV Shows' },
  { href: '/movies', icon: Film, label: 'Movies' },
];

const libraryNavItems = [
    { href: '/my-list', icon: List, label: 'My List' },
    { href: '/shared', icon: Users, label: 'Shared' },
];

function NavItem({ item, isMobile = false }: { item: typeof mainNavItems[0], isMobile?: boolean }) {
  const pathname = usePathname();
  const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
  
  if (isMobile) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
        <TooltipTrigger asChild>
            <Link href={item.href}>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                'h-12 w-12 rounded-full',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={item.label}
            >
                <item.icon className="h-6 w-6" />
            </Button>
            </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
            <p>{item.label}</p>
        </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}

function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('query') || '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else if (pathname === '/search') {
      router.push('/search');
    }
  };

  React.useEffect(() => {
    // Clear search when navigating away from search page
    if (pathname !== '/search') {
        setSearchQuery('');
    }
  }, [pathname]);

  return (
    <form onSubmit={handleSearch} className="relative hidden group-[.is-search-focused]:block md:block">
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
  )
}


export function Sidebar() {

  return (
    <>
    {/* Desktop Sidebar */}
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-16 flex-col items-center gap-8 border-r border-border/40 bg-background py-4 md:flex">
      <Link href="/">
        <Clapperboard className="h-6 w-6 text-primary" />
      </Link>
      <nav className="flex flex-col items-center gap-4">
        {mainNavItems.map((item) => <NavItem key={item.href} item={item} />)}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4">
        {libraryNavItems.map((item) => <NavItem key={item.href} item={item} />)}
      </nav>
    </aside>

    {/* Mobile Bottom Nav */}
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-around">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} item={item} isMobile />
        ))}
        <NavItem item={libraryNavItems[0]} isMobile />
      </div>
    </nav>
    </>
  );
}
