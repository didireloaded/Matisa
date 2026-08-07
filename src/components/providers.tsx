import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "../contexts/AuthContext";
import { VoiceProvider } from "../contexts/VoiceContext";
import { RecordedVoicePlaybackProvider } from "@/features/recorded-voice";

import { queryClient } from "../lib/queryClient";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VoiceProvider>
          <RecordedVoicePlaybackProvider>
            {children}
            <Toaster theme="dark" />
          </RecordedVoicePlaybackProvider>
        </VoiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
