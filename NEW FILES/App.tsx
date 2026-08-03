// src/App.tsx — COMPLETE FIXED ROUTER
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout
import AppLayout from './layouts/AppLayout';

// Pages (eager load critical, lazy load others)
import Home from './pages/Home';
import Explore from './pages/Explore';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import KaraokeRoom from './pages/KaraokeRoom';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';

// Placeholder pages (replace with real components later)
import NoteDetail from './pages/NoteDetail';
import EventDetail from './pages/EventDetail';
import Inbox from './pages/Inbox';
import ChatRoom from './pages/ChatRoom';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import ExploreRooms from './pages/ExploreRooms';
import ExploreEvents from './pages/ExploreEvents';
import ExplorePeople from './pages/ExplorePeople';

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'explore', element: <Explore /> },
      { path: 'explore/rooms', element: <ExploreRooms /> },
      { path: 'explore/events', element: <ExploreEvents /> },
      { path: 'explore/people', element: <ExplorePeople /> },
      { path: 'rooms', element: <Rooms /> },
      { path: 'room/:roomId', element: <RoomDetail /> },
      { path: 'karaoke/:roomId', element: <KaraokeRoom /> },
      { path: 'note/:noteId', element: <NoteDetail /> },
      { path: 'event/:eventId', element: <EventDetail /> },
      { path: 'chat', element: <Inbox /> },
      { path: 'chat/:conversationId', element: <ChatRoom /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/:username', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
