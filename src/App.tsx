import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Music } from './pages/Music';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Chat } from './pages/Chat';
import { KaraokeRoom } from './components/karaoke/KaraokeRoom';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/music" element={<Music />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
          {/* Standalone Route for Chat */}
          <Route path="/chat/:id" element={<Chat />} />
          {/* Standalone Route for Karaoke */}
          <Route path="/room/:id" element={<KaraokeRoom />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
