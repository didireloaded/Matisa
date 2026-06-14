export const T = {
  bg:      '#0B0B0B',
  surface: '#151515',
  s2:      '#222222',
  border:  '#222222',
  text:    '#FFFFFF',
  muted:   '#A0A0A0',
  primary: '#FF9D2E',
  sand:    '#FF6B6B',
  sky:     '#2D7DD2',
  success: '#4CAF7D',
} as const;

const GRADIENTS = [
  'linear-gradient(135deg,#FF9D2E,#8B5A1A)',
  'linear-gradient(135deg,#FF6B6B,#8B1A1A)',
  'linear-gradient(135deg,#2D7DD2,#1A3A60)',
  'linear-gradient(135deg,#4CAF7D,#1A5C3A)',
  'linear-gradient(135deg,#8B3A1F,#3A1A0E)',
  'linear-gradient(135deg,#6B2D7D,#2A1040)',
  'linear-gradient(135deg,#2D7D6B,#1A4038)',
  'linear-gradient(135deg,#1A2D6B,#0A1230)',
];

export function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}
