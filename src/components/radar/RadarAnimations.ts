import { Variants } from 'framer-motion';

// Generates a subtle, infinite floating animation for nodes
export const generateFloatAnimation = (index: number): Variants => {
  // Use index to create deterministic pseudo-random values so they don't jump on re-render
  const yOffset = 4 + (index % 8); // 4px to 12px
  const duration = 3 + (index % 5); // 3s to 8s

  return {
    initial: { y: 0, opacity: 0, scale: 0 },
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
        opacity: { duration: 0.8, ease: 'easeOut' },
        scale: { type: 'spring', damping: 15, stiffness: 200, mass: 0.8 }
      },
    },
  };
};

export const centerPulseAnimation: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 20px rgba(200, 82, 26, 0.4), inset 0 0 10px rgba(200, 82, 26, 0.2)',
      '0 0 50px rgba(200, 82, 26, 0.8), inset 0 0 20px rgba(200, 82, 26, 0.5)',
      '0 0 20px rgba(200, 82, 26, 0.4), inset 0 0 10px rgba(200, 82, 26, 0.2)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
