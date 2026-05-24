"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook that simulates a loading state on initial mount,
 * giving skeleton screens time to display during page transitions.
 *
 * @param minDuration - Minimum time in ms to show the skeleton (default 600)
 * @param delay - Optional extra delay before starting to load (default 0)
 */
export function useLoadingState(minDuration = 600, delay = 0) {
  const [isLoading, setIsLoading] = useState(true);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      loadTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, minDuration);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, [minDuration, delay]);

  return isLoading;
}
