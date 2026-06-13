import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

interface AppState {
  session: Session | null;
  location: { lat: number; lng: number } | null;
  ghostMode: 'invisible' | 'approximate' | 'exact';
  setSession: (session: Session | null) => void;
  setLocation: (location: { lat: number; lng: number } | null) => void;
  setGhostMode: (mode: 'invisible' | 'approximate' | 'exact') => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  location: null,
  ghostMode: 'exact',
  setSession: (session) => set({ session }),
  setLocation: (location) => set({ location }),
  setGhostMode: (ghostMode) => set({ ghostMode }),
}));
