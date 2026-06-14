export const T = {
  bg:      '#0B0B0B',
  surface: '#151515',
  s2:      '#222222',
  border:  '#222222',
  text:    '#FFFFFF',
  muted:   '#A0A0A0',
  primary: '#FF9D2E', // Orange
  secondary: '#A855F7', // Electric Purple
  accent1: '#00E5FF', // Neon Blue
  accent2: '#FFD700', // Gold
  accent3: '#FF6B6B', // Pink
  accent4: '#32CD32', // Lime
} as const;

const GRADIENTS = [
  'linear-gradient(135deg, #FF9D2E, #FF6B6B)', // Orange to Pink
  'linear-gradient(135deg, #A855F7, #FF6B6B)', // Purple to Pink
  'linear-gradient(135deg, #00E5FF, #A855F7)', // Blue to Purple
  'linear-gradient(135deg, #32CD32, #00E5FF)', // Lime to Blue
  'linear-gradient(135deg, #FFD700, #FF9D2E)', // Gold to Orange
  'linear-gradient(135deg, #FF6B6B, #A855F7)', // Pink to Purple
  'linear-gradient(135deg, #FF9D2E, #0B0B0B)', // Orange to Black
  'linear-gradient(135deg, #A855F7, #0B0B0B)', // Purple to Black
];

export function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}
