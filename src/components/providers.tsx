import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { Toaster } from './ui/sonner';
import { AuthProvider } from '../contexts/AuthContext';

import { queryClient } from '../lib/queryClient';
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
