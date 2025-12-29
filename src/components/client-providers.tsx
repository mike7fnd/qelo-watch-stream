'use client';

import { MyListProvider } from '@/hooks/use-my-list';
import type { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return <MyListProvider>{children}</MyListProvider>;
}
