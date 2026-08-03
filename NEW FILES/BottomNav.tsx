// src/components/BottomNav.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Mic, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: null, label: 'Create', path: '/create', isCenter: true },
  { icon: Mic, label: 'Rooms', path: '/rooms' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="h-16 backdrop-blur-xl bg-black/60 rounded-full border border-white/[0.08] flex items-center justify-around px-2 shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => navigate('/create')}
                className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] flex items-center justify-center shadow-lg shadow-teal-500/20 border-2 border-white/10 transition-transform active:scale-95"
                aria-label="Create"
              >
                <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
              </button>
            );
          }

          const active = isActive(item.path);
          const Icon = item.icon!;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 p-2 min-w-[56px] transition-colors"
              aria-label={item.label}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-[#00D9C0]' : 'text-white/40'
                }`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-[#00D9C0]' : 'text-white/30'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
