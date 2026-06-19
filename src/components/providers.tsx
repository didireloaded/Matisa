import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import { VoiceProvider } from '../contexts/VoiceContext';

import { queryClient } from '../lib/queryClient';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VoiceProvider>
          {children}
          <Toaster theme="dark" />
        </VoiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
