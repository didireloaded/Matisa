import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { BottomNavigation } from "./BottomNavigation";
import { CreateSheet } from "../create/CreateSheet";

export function MainLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-[#24A3C7]/30">
      {/* Ambient lighting environment matching Reelio background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[400px] ambient-glow-cyan opacity-80" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] ambient-glow-purple opacity-60" />
      </div>

      {/* Main mobile framing container */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[430px] flex-col overflow-hidden shadow-2xl shadow-black bg-[#06101D]/90 border-x border-white/5">
        <TopNavigation />

        <main className="flex-1 overflow-y-auto pb-28 no-scrollbar">
          <Outlet />
        </main>

        <BottomNavigation onOpenCreate={() => setIsCreateOpen(true)} />

        <CreateSheet open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </div>
    </div>
  );
}
