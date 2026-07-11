# MATISA LIVE EVENTS INTERACTION INVENTORY

| Component Path | Visible Label | Expected Behavior | Current Handler | Service | Database Table | Status |
|---|---|---|---|---|---|---|
| `src/pages/Events.tsx` | Create Event Button | Open CreateEventModal / navigate to create | `setIsCreateModalOpen(true)` | Local state / `useEvents` | `events` | PARTIAL |
| `src/pages/Events.tsx` | Featured Event Card | Open event detail page / join lobby | `onClick={() => {}}` | None | `events` | UNWIRED |
| `src/components/events/CreateEventModal.tsx` | Create Event Form Submit | Validate and save draft or publish | Local `handleSubmit` | Raw Supabase / local hook | `events` | PARTIAL |
| `src/components/live/CreateLiveStreamModal.tsx` | Go Live Button | Create `live_streams` record and start broadcast | Local `handleSubmit` | `live_streams` table | `live_streams` | PARTIAL |
