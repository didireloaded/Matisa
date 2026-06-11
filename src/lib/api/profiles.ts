import { useQuery } from "@tanstack/react-query";
import { PROFILES } from "../../data/mock";
import type { Profile } from "../../data/types";

export function useProfiles() {
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300));
      return PROFILES;
    },
  });
}

export function useProfile(id: string) {
  return useQuery<Profile | undefined>({
    queryKey: ["profiles", id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 200));
      return PROFILES.find(p => p.id === id);
    },
  });
}
