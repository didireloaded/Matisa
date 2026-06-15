---
name: matisa-ui-patterns
description: Guidelines and patterns for Matisa UI components, including Framer Motion animations and layout structure. Use this skill when building new UI elements for the Matisa project.
---

# Matisa UI Patterns

When creating new React UI components for Matisa, strictly adhere to these patterns:

## 1. Animations (Framer Motion)
Matisa relies heavily on micro-animations for a premium feel. Use `framer-motion` for all dynamic component entrances and interactions.

### Circular / Radial Layouts
For circular menus or radial layouts (e.g., `CreateRadialMenu`), use trigonometric functions (`Math.cos`, `Math.sin`) combined with Framer Motion:
- Stagger animations using `transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}`.
- Start at `angle - 90` to position 0 degrees at the top (12 o'clock).

### Overlays and Modals
- Wrap modals in `<AnimatePresence>`.
- Use `backdrop-blur-sm` and `bg-black/70` for the background overlay.
- Modal contents should slide up or fade in (`initial={{ opacity: 0, scale: 0.9 }}`, `animate={{ opacity: 1, scale: 1 }}`).

## 2. Design System & Theming
- **Colors:** Use the defined theme tokens. For vibrant, premium components, use subtle gradients and glows (e.g., `background: "linear-gradient(135deg, #FF9D2E, #A855F7)", boxShadow: "0 4px 20px rgba(255,157,46,0.5)"`).
- **Icons:** Use `lucide-react`. Size them consistently (usually `size={20}` or `size={24}`).
- **Spacing:** Rely on Tailwind utilities (`gap-`, `p-`, `m-`).

## 3. Component Structure
- Always export named functions (`export function MyComponent() { ... }`).
- Define explicit `interface` for props.
- Keep components small and focused.
