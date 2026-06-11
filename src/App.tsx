import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Radar } from './pages/Radar';
import { Create } from './pages/Create';
import { Events } from './pages/Events';
import { Profile } from './pages/Profile';

import { Communities } from './pages/Communities';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/radar" element={<Radar />} />
            <Route path="/create" element={<Create />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/communities" element={<Communities />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
