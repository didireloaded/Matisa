# Design System

Matisa employs a premium "Sleek Dark Mode" aesthetic specifically tailored to feel immersive and hyper-local to the Namibian market. The UI strips away heavy dashboard elements and maps, focusing purely on content and people.

## CSS Variables (`index.css`)

All colors are controlled via tailwind configuration pointing to CSS variables.

- **Background:** `#0B0B0B`
- **Surface/Card:** `#151515`
- **Primary Accent:** `#FF9D2E` (Matisa Orange)
- **Secondary Accent:** `#A855F7` (Purple)
- **Destructive:** `#FF6B6B` (Red)
- **Borders:** `#222222`

## Typography

- **Base Font:** Geist Variable (`font-sans`)
- **Display/Headings:** Syne (`font-display`)
- **Weights:** Heavy emphasis on bold, tight tracking for headings, and relaxed line-heights for feed content.

## Interactions & Animation

We use Framer Motion heavily to make the app feel alive.
- **Springs over Easing:** Tap interactions use spring physics rather than linear CSS transitions.
- **Micro-interactions:** Buttons scale down slightly when pressed. Story rings pulse. 
- **Modals:** Slide up smoothly from the bottom, heavily rounded (`rounded-[2rem]`).

## Global UI Principles
1. **No Placeholders:** Never use a permanent skeleton. If there is no data, use a highly polished `PremiumEmptyState` to guide the user.
2. **Glassmorphism sparingly:** Used mainly for the bottom navigation bar and sticky headers to maintain context while scrolling.
3. **Immersive Media:** Images and videos bleed to the edges of their containers. Avatar sizes are generous.
