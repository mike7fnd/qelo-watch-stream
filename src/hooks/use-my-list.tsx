'use client';

import type { Media } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MyListContextType {
  list: Media[];
  addToList: (movie: Media) => void;
  removeFromList: (movieId: number) => void;
  isInList: (movieId: number) => boolean;
}

const MyListContext = createContext<MyListContextType | undefined>(undefined);

const getInitialList = (): Media[] => {
    if (typeof window === 'undefined') return [];
    try {
        const item = window.localStorage.getItem('qelo-my-list');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.warn('Error reading localStorage "qelo-my-list":', error);
        return [];
    }
}

export function MyListProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Media[]>([]);

  useEffect(() => {
    setList(getInitialList());
  }, []);

  useEffect(() => {
    try {
        window.localStorage.setItem('qelo-my-list', JSON.stringify(list));
    } catch (error) {
        console.warn('Error setting localStorage "qelo-my-list":', error);
    }
  }, [list]);

  const addToList = (movie: Media) => {
    setList((currentList) => {
      if (currentList.some(item => item.id === movie.id)) {
        return currentList;
      }
      return [...currentList, movie];
    });
  };

  const removeFromList = (movieId: number) => {
    setList((currentList) => currentList.filter((item) => item.id !== movieId));
  };

  const isInList = (movieId: number) => {
    return list.some((item) => item.id === movieId);
  };

  return (
    <MyListContext.Provider value={{ list, addToList, removeFromList, isInList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const context = useContext(MyListContext);
  if (context === undefined) {
    throw new Error('useMyList must be used within a MyListProvider');
  }
  return context;
}
