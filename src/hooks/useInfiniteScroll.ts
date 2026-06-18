/**
 * Hook for infinite scroll pagination
 * Observes a sentinel element and triggers callback when visible
 */

import { useEffect, useRef, useCallback, RefObject } from "react";

export interface UseInfiniteScrollOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  onLoadMore: () => void | Promise<void>;
  enabled?: boolean;
}

export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "100px",
  root = null,
  onLoadMore,
  enabled = true,
}: UseInfiniteScrollOptions): RefObject<T | null> {
  const ref = useRef<T>(null);
  const isLoadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && enabled && !isLoadingRef.current) {
        isLoadingRef.current = true;
        Promise.resolve(onLoadMore()).then(() => {
          isLoadingRef.current = false;
        });
      }
    },
    [onLoadMore, enabled],
  );

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root,
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, handleIntersection, threshold, rootMargin, root]);

  return ref;
}
