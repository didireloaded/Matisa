import { useQuery } from "@tanstack/react-query";
import { POSTS } from "../../data/mock";
import type { Post } from "../../data/types";

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      // In production: await supabase.from("posts").select("*, profiles(*)").order("created_at", { ascending: false })
      await new Promise(r => setTimeout(r, 400));
      return POSTS;
    },
  });
}

export function usePost(id: string) {
  return useQuery<Post | undefined>({
    queryKey: ["posts", id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 200));
      return POSTS.find(p => p.id === id);
    },
  });
}
