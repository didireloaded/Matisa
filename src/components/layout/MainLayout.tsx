import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
