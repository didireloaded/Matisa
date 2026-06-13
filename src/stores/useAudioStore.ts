import { create } from 'zustand';

interface AudioState {
  currentlyPlayingId: string | null;
  volume: number;
  isMuted: boolean;
  setCurrentlyPlaying: (id: string | null) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  pauseAll: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentlyPlayingId: null,
  volume: 1,
  isMuted: false,
  setCurrentlyPlaying: (id) => set({ currentlyPlayingId: id }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  pauseAll: () => set({ currentlyPlayingId: null }),
}));
