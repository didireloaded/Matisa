export interface RadarNode {
  id: string;
  name: string;
  avatar: string | null;
  distanceKm: number;
  online: boolean;
  x: number;
  y: number;
  ringIndex: number;
  size: number;
  animDuration: string;
  animDelay: string;
}

export function getRingIndex(distanceKm: number): number {
  if (distanceKm <= 2) return 0; // Inner
  if (distanceKm <= 10) return 1; // Middle
  if (distanceKm <= 20) return 2; // Outer
  return 3; // Edge
}

export function getAvatarSize(ringIndex: number): number {
  switch (ringIndex) {
    case 0: return 60;
    case 1: return 50;
    case 2: return 40;
    default: return 32;
  }
}

export function hasCollision(
  x: number,
  y: number,
  size: number,
  existingNodes: RadarNode[]
): boolean {
  // Avoid center node collision (assume center is at 0,0 and size is around 80px)
  const centerDistance = Math.sqrt(x * x + y * y);
  if (centerDistance < (size / 2) + 40 + 10) return true;

  const PADDING = 15;
  return existingNodes.some(node => {
    const minDistance = (size / 2) + (node.size / 2) + PADDING;
    const dx = node.x - x;
    const dy = node.y - y;
    return Math.sqrt(dx * dx + dy * dy) < minDistance;
  });
}
