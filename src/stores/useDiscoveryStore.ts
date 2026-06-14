import { create } from "zustand";

export type FilterType =
  | "All"
  | "Creators"
  | "Music"
  | "Events"
  | "Verified"
  | "Friends"
  | "Online";

interface DiscoveryState {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;

  distanceRadius: number; // in km
  setDistanceRadius: (radius: number) => void;

  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;

  ghostMode: boolean;
  setGhostMode: (ghost: boolean) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  activeFilter: "All",
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  distanceRadius: 25,
  setDistanceRadius: (radius) => set({ distanceRadius: radius }),

  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  ghostMode: false,
  setGhostMode: (ghost) => set({ ghostMode: ghost }),
}));
