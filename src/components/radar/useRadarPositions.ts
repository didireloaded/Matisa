import { useMemo } from 'react';
import { RadarNode, getRingIndex, getAvatarSize, hasCollision } from './radarUtils';

export interface RawRadarUser {
  id: string;
  name: string;
  avatar: string | null;
  distanceKm: number;
  online: boolean;
}

export function useRadarPositions(users: RawRadarUser[], containerSizePx: number = 400) {
  return useMemo(() => {
    const positionedNodes: RadarNode[] = [];
    const maxRadius = containerSizePx / 2;

    // Define ring boundaries (in pixels relative to container center)
    const ringRadii = [
      { min: maxRadius * 0.25, max: maxRadius * 0.45 }, // Inner
      { min: maxRadius * 0.45, max: maxRadius * 0.65 }, // Middle
      { min: maxRadius * 0.65, max: maxRadius * 0.85 }, // Outer
      { min: maxRadius * 0.85, max: maxRadius * 0.95 }, // Edge
    ];

    for (const user of users) {
      const ringIndex = getRingIndex(user.distanceKm);
      const size = getAvatarSize(ringIndex);
      const ring = ringRadii[ringIndex];

      let placed = false;
      let x = 0;
      let y = 0;
      const MAX_ATTEMPTS = 30;

      // Deterministic pseudo-random seed based on user ID for stable layout
      // Or we can just use Math.random() since it's inside useMemo
      // But we want them to stay in the same place if they re-render.
      // So we use a simple hash of the ID.
      let seed = Array.from(user.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // Distribute evenly around the circle, with some randomness
        const angle = random() * Math.PI * 2;
        const radius = ring.min + (random() * (ring.max - ring.min));

        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;

        if (!hasCollision(x, y, size, positionedNodes)) {
          placed = true;
          break;
        }
      }

      // Even if not placed perfectly (collision), we just use the last calculated position
      // to guarantee rendering, but collision should be rare with 30 attempts.
      positionedNodes.push({
        ...user,
        x,
        y,
        ringIndex,
        size,
        animDuration: `${4 + random() * 4}s`,
        animDelay: `${-random() * 5}s`,
      });
    }

    return positionedNodes;
  }, [users, containerSizePx]);
}
