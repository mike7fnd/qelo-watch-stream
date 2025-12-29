'use client';

import { useState, useEffect, useCallback } from 'react';

const getInitialProgress = (movieId: string): number => {
  if (typeof window === 'undefined') {
    return 0;
  }
  const savedProgress = localStorage.getItem(`qelo-progress-${movieId}`);
  return savedProgress ? JSON.parse(savedProgress) : 0;
};

export function useWatchProgress(movieId: string) {
  const [progress, setProgress] = useState<number>(() => getInitialProgress(movieId));

  const saveProgress = useCallback((newProgress: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`qelo-progress-${movieId}`, JSON.stringify(newProgress));
    }
  }, [movieId]);

  useEffect(() => {
    // This effect ensures we have the correct initial state on the client
    setProgress(getInitialProgress(movieId));
  }, [movieId]);

  useEffect(() => {
    // Save progress whenever it changes, debounced slightly
    const handler = setTimeout(() => {
      saveProgress(progress);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [progress, saveProgress]);

  const setProgressCallback = useCallback((value: number | ((prevState: number) => number)) => {
    setProgress(currentProgress => {
      const newProgress = typeof value === 'function' ? value(currentProgress) : value;
      return Math.max(0, Math.min(100, newProgress));
    });
  }, []);

  return { progress, setProgress: setProgressCallback };
}
