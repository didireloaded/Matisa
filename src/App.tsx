import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Music } from './pages/Music';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';

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
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
