# Component Library

Matisa's frontend components are structured into functional domains. All components follow the "Content is the interface" design philosophy, avoiding heavy dashboard-style wrappers.

## `src/components/common/`

Reusable primitives used across the application.

- **`Avatar.tsx`**: Consistent user picture rendering with online indicators and creator rings.
- **`CreateRadialMenu.tsx`**: The primary floating action button (FAB) that expands into a radial dial to create Notes, Stories, Rooms, or Voice posts.
- **`EmptyState.tsx`**: Beautifully designed fallbacks for empty feeds or lists.
- **`PremiumEmptyState.tsx`**: Upgraded empty states with illustrations and clear call-to-actions.

## `src/components/feed/`

Components for the main social feeds.

- **`RichPostCard.tsx` / `PostCard.tsx`**: Renderers for Notes and media content. Includes rich interactions (like, comment, share).
- **`CreateNoteModal.tsx`**: The composer for creating new text/image Notes.
- **`CreateVoicePostModal.tsx`**: Composer for recording audio-first posts.

## `src/components/stories/`

Ephemeral content viewers and creators.

- **`StoryBubble.tsx`**: The circular ringed avatar seen at the top of the feed.
- **`StoriesViewer.tsx`**: Fullscreen Instagram-style story progression component.
- **`CreateStoryModal.tsx`**: Camera integration for capturing 24h content.

## `src/components/karaoke/`

WebRTC audio room integrations.

- **`KaraokeRoom.tsx`**: The immersive UI for live singing (Stage, Audience, Lyrics sync).
- **`CreateVoiceRoomModal.tsx`**: Setup screen for starting a room.

## Deprecated Components (Removed)

The following components have been **permanently purged** as part of the architecture sync:
- `src/components/discovery/UserBubble.tsx`
- `src/components/discovery/FilterBar.tsx`
- `src/components/discovery/ProfilePreviewCard.tsx`
- `src/components/radar/*`
- Legacy map UI elements.
