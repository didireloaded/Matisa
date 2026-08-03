import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const MainLayout = lazy(() =>
  import("@/components/layout/MainLayout").then((m) => ({ default: m.MainLayout })),
);
const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Discovery = lazy(() => import("@/pages/Discovery").then((m) => ({ default: m.Discovery })));
const Notes = lazy(() => import("@/pages/Notes").then((m) => ({ default: m.Notes })));
const Events = lazy(() => import("@/pages/Events").then((m) => ({ default: m.Events })));
const Activity = lazy(() => import("@/pages/Activity").then((m) => ({ default: m.Activity })));
const Profile = lazy(() => import("@/pages/Profile").then((m) => ({ default: m.Profile })));
const Messages = lazy(() => import("@/pages/Messages").then((m) => ({ default: m.Messages })));
const Settings = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));
const Auth = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Auth })));
const Onboarding = lazy(() =>
  import("@/pages/Onboarding").then((m) => ({ default: m.Onboarding })),
);
const Chat = lazy(() => import("@/pages/Chat").then((m) => ({ default: m.Chat })));
const KaraokeRoom = lazy(() =>
  import("@/components/karaoke/KaraokeRoom").then((m) => ({ default: m.KaraokeRoom })),
);

const Rooms = lazy(() => import("@/pages/Rooms").then((m) => ({ default: m.Rooms })));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Discovery />} />
        <Route path="/discovery" element={<Navigate to="/explore" replace />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<Events />} />
        {/* Music removed — redirect to Explore */}
        <Route path="/music" element={<Navigate to="/explore" replace />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/inbox" element={<Messages />} />
        <Route path="/messages" element={<Navigate to="/inbox" replace />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/messages/:conversationId" element={<Chat />} />
      <Route path="/chat/:id" element={<Chat />} />
      {/* Consolidated room routes — single canonical pattern */}
      <Route path="/rooms/:roomId" element={<KaraokeRoom />} />
      <Route path="/room/:id" element={<Navigate to="/rooms/:id" replace />} />
      <Route path="/karaoke/:roomId" element={<Navigate to="/rooms/:roomId" replace />} />
      <Route path="/live/:sessionId" element={<KaraokeRoom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
