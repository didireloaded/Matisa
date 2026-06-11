import { useQuery } from "@tanstack/react-query";
import { EVENTS } from "../../data/mock";
import type { EventItem } from "../../data/types";

export function useEvents() {
  return useQuery<EventItem[]>({
    queryKey: ["events"],
    queryFn: async () => { await new Promise(r => setTimeout(r, 300)); return EVENTS; },
  });
}
