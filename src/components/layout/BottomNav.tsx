import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, Calendar, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Radar', path: '/radar', icon: Compass },
    { name: 'Create', path: '/create', icon: PlusSquare },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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
