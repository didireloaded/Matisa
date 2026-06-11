# Matisa Social UI Redesign

The objective is to execute a complete visual and architectural overhaul of the Matisa application to transition it from a dashboard/discovery platform into a premium, modern social network (similar to Instagram, Threads, TikTok, BeReal). The core principle is: **People are the content. Content is the interface.**

## User Review Required

- **Bottom Navigation Layout:** Given the new sections, I propose the following 5 items for the Bottom Navigation bar: `Home`, `Explore`, `Music`, `Activity`, `Profile`. Does this sound good, or would you prefer a central "Create" button instead of one of these?
- **Create Flow:** If we use the bottom navigation for `Home`, `Explore`, `Music`, `Activity`, `Profile`, the "Create Post" action will need to be floating on the Home feed or inside the header. Is this acceptable?
- **Messages:** As requested, Messages will be accessible via the top-right icon on the Home screen header. 

## Proposed Changes

We will restructure the entire application routing, remove old dashboard-style views, and introduce new, content-first components.

### Routing & Layout

#### [MODIFY] [App.tsx](file:///c:/Users/PC/Documents/APPS/Matisa/src/App.tsx)
Update the routes. 
- **Remove:** `/radar`, `/events`, `/communities`, `/create`.
- **Add:** `/explore`, `/music`, `/activity`, `/messages`.

#### [MODIFY] [BottomNav.tsx](file:///c:/Users/PC/Documents/APPS/Matisa/src/components/layout/BottomNav.tsx)
Update icons and navigation links to match the new 5 core tabs: `Home`, `Explore`, `Music`, `Activity`, `Profile`.

---

### Core Screens

#### [MODIFY] [Home.tsx](file:///c:/Users/PC/Documents/APPS/Matisa/src/pages/Home.tsx)
- Remove all hero sections, dashboard cards, and widget-style layouts.
- Add a sticky header with the Matisa Logo, Search icon, and Messages icon.
- Implement the horizontal scrolling `Activity Bubbles` (Stories) section at the top.
- Implement the Main Feed featuring a list of rich `PostCard` components.

#### [NEW] 
<truncated 3096 bytes>