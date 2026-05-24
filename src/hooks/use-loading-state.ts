"use client";

import { useState, useEffect } from "react";

/**
 * Hook that simulates a loading state on initial mount,
 * giving skeleton screens time to display during page transitions.
 *
 * @param minDuration - Minimum time in ms to show the skeleton (default 600)
 * @param delay - Optional extra delay before starting to load (default 0)
 */
export function useLoadingState(minDuration = 600, delay = 0) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const loadTimer = setTimeout(() => {
        setIsLoading(false);
      }, minDuration);

      return () => clearTimeout(loadTimer);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [minDuration, delay]);

  return isLoading;
}
