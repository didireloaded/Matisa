import { Variants } from 'framer-motion';

// Generates a subtle, infinite floating animation for nodes
export const generateFloatAnimation = (index: number): Variants => {
  // Use index to create deterministic pseudo-random values so they don't jump on re-render
  const yOffset = 4 + (index % 8); // 4px to 12px
  const duration = 3 + (index % 5); // 3s to 8s

  return {
    initial: { y: 0, opacity: 0, scale: 0.8 },
    animate: {
      y: [0, -yOffset, 0],
      opacity: 1,
      scale: 1,
      transition: {
        y: {
          duration: duration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
        opacity: { duration: 0.5 },
        scale: { type: 'spring', duration: 0.6 }
      },
    },
  };
};

export const centerPulseAnimation: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
