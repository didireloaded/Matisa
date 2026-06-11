export const C = {
  bg:          "#0F0D0B",
  surface:     "#1C1814",
  surface2:    "#221D18",
  border:      "#2E2822",
  text:        "#F5F0EA",
  muted:       "#8A7F74",
  primary:     "#C8521A",
  sand:        "#E8A055",
  sky:         "#2D7DD2",
  success:     "#4CAF7D",
  warning:     "#E8A055",
} as const;

export const GRADIENT = {
  primary:  "linear-gradient(135deg, #C8521A 0%, #8B3A1F 100%)",
  sand:     "linear-gradient(135deg, #E8A055 0%, #C8521A 100%)",
  sky:      "linear-gradient(135deg, #2D7DD2 0%, #1A4A8A 100%)",
  success:  "linear-gradient(135deg, #4CAF7D 0%, #2A7D51 100%)",
  dark:     "linear-gradient(180deg, #1C1814 0%, #0F0D0B 100%)",
  hero:     "linear-gradient(160deg, #1C1814 0%, #2A1A0E 50%, #0F0D0B 100%)",
  card1:    "linear-gradient(135deg, #C8521A, #6B2D1A)",
  card2:    "linear-gradient(135deg, #2D7DD2, #1A3A60)",
  card3:    "linear-gradient(135deg, #4CAF7D, #1A5C3A)",
  card4:    "linear-gradient(135deg, #E8A055, #8B5A1A)",
  card5:    "linear-gradient(135deg, #8B3A1F, #3A1A0E)",
  card6:    "linear-gradient(135deg, #6B2D7D, #2A1040)",
  card7:    "linear-gradient(135deg, #2D7D6B, #1A4038)",
} as const;

export const REGION_COLORS = [
  GRADIENT.card1, GRADIENT.card2, GRADIENT.card3, GRADIENT.card4,
  GRADIENT.card5, GRADIENT.card6, GRADIENT.card7, GRADIENT.card1,
  GRADIENT.card2, GRADIENT.card3, GRADIENT.card4, GRADIENT.card5,
  GRADIENT.card6, GRADIENT.card7,
];
