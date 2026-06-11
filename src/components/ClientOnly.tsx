import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after the initial client mount so that components
 * doing time/locale/random work don't fail SSR hydration. Server render
 * always returns the fallback; client matches that on initial paint and
 * then swaps in children inside a layout effect.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
