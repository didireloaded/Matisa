/**
 * Hook to detect media query changes
 * Useful for responsive design and layout decisions
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Create listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use addEventListener for better browser support
    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Common media query breakpoints
 */
export const BREAKPOINTS = {
  xs: '(max-width: 320px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)',
} as const;

/**
 * Preset hooks for common breakpoints
 */
export function useIsMobile() {
  return useMediaQuery(BREAKPOINTS.md);
}

export function useIsTablet() {
  return useMediaQuery(BREAKPOINTS.lg);
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: 1025px)`);
}
