import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { TopNavigation } from "./TopNavigation";
import { BottomNavigation } from "./BottomNavigation";
import { CreateSheet } from "../create/CreateSheet";

export function MainLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDockCompact, setIsDockCompact] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const previousScrollTop = useRef(0);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Matisa added to your home screen!");
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const difference = currentScrollTop - previousScrollTop.current;

      // Always restore the full dock near the top.
      if (currentScrollTop < 24) {
        setIsDockCompact(false);
      } else if (difference > 6 && currentScrollTop > 72) {
        // Browsing downward -> shrink dock
        setIsDockCompact(true);
      } else if (difference < -6) {
        // Scrolling back toward top -> expand dock
        setIsDockCompact(false);
      }

      previousScrollTop.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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

        {showInstallBanner && (
          <div className="mx-4 mt-2 mb-1 p-3 rounded-[20px] bg-gradient-to-r from-[#24A3C7]/20 to-[#6139F2]/20 border border-[#24A3C7]/40 flex items-center justify-between z-30 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <Download size={18} className="text-[#24A3C7] shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Add Matisa to Home Screen
                </div>
                <div className="text-[10px] text-white/60 truncate">
                  Install app for fast offline access
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-full bg-[#24A3C7] text-white text-xs font-bold shadow-md active:scale-95 transition"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-white/50 hover:text-white"
                aria-label="Dismiss install banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-28 no-scrollbar">
          <Outlet />
        </main>

        <BottomNavigation compact={isDockCompact} onOpenCreate={() => setIsCreateOpen(true)} />

        <CreateSheet open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </div>
    </div>
  );
}

export default MainLayout;
