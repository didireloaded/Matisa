import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { FloatingVoicePlayer } from "@/components/voice/FloatingVoicePlayer";
import { AppRoutes } from "@/app/routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <VoiceProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#24A3C7] border-t-transparent" />
                  <span className="text-xs font-semibold tracking-wider text-white/50 font-display">
                    MATISA
                  </span>
                </div>
              </div>
            }
          >
            <AppRoutes />
            <FloatingVoicePlayer />
          </Suspense>
          <Toaster position="top-center" theme="dark" />
        </BrowserRouter>
      </VoiceProvider>
    </AuthProvider>
  );
}
