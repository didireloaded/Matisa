/**
 * Responsive navigation that switches between mobile bottom nav
 * and desktop side nav based on screen size
 */

import { useIsMobile } from '@/hooks/useMediaQuery';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';

export function ResponsiveNav() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <BottomNav />;
  }

  return <SideNav />;
}
