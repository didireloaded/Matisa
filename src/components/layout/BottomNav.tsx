import { NavLink } from 'react-router-dom';
import { Home, Compass, Music2, Bell, User } from 'lucide-react';
import { T } from '@/components/common';

export function BottomNav() {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Music', path: '/music', icon: Music2 },
    { name: 'Inbox', path: '/messages', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe" style={{ backgroundColor: `${T.surface}E6`, backdropFilter: 'blur(12px)', borderColor: T.border }}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
                  isActive ? 'text-[#F5F0EA]' : 'text-[#8A7F74] hover:text-[#F5F0EA]'
                }`
              }
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
