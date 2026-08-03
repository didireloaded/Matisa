# Home Conversation Composer Design

## Goal

Replace the two Home quick-action cards with the supplied compact conversation composer, then present the feed as Trending Conversations with an honest empty state.

## Approved layout

The Home screen keeps its existing stories, dark Matisa styling, feed tabs, and post cards. Directly below Stories, it shows one rounded composer card containing the current user avatar, a “What’s on your mind?” prompt, a send action, and four compact actions for Note, Voice Note, Story, and Event.

The Note prompt, send button, Note action, and “Ask a Question” empty-state button all open the existing note composer. Event opens the existing Events screen. Voice Note and Story remain visibly disabled because the active frontend does not currently provide honest working creation flows for them.

Below the feed tabs, the screen shows the heading “TRENDING CONVERSATIONS”. When no notes are available after loading, it shows the supplied “No Conversations Yet” message and orange “Ask a Question” button. Normal notes continue to render below the heading when available.

## Constraints

- Frontend only.
- Preserve the existing near-black, orange, rounded Matisa UI.
- Do not add backend work, dependencies, routes, or fake functionality.
- Remove the always-visible successful load status pill. Retain an error message only when loading fails.
- Touch only the active Home implementation rendered by `src/main.tsx` and one focused reusable Home UI component.
