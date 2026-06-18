import { useState, useEffect } from "react";
import { Search, MapPin, Users, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Post, Profile } from "@/types";
import { SearchAI } from "@/services/ai";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/common/Avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { id: "People", label: "People" },
  { id: "Creators", label: "Creators" },
  { id: "Opportunities", label: "Opportunities" },
  { id: "Rooms", label: "Rooms" },
  { id: "Events", label: "Events" },
  { id: "Voice", label: "Voice" },
];

export function Discovery() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("People");

  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingDisc, setLoadingDisc] = useState(false);

  useEffect(() => {
    setLoadingDisc(true);
    setTimeout(() => {
      setLoadingDisc(false);
    }, 400);
  }, [activeCategory]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchProfiles([]);
      setSearchPosts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const aiSearch = await SearchAI.search(query, profile?.id);

        if (aiSearch && aiSearch.results && aiSearch.results.length > 0) {
          setSearchProfiles(aiSearch.results as Profile[]);
          if (
            aiSearch.ai_intent?.intent_category?.includes("post") ||
            aiSearch.ai_intent?.expanded_terms
          ) {
            const terms = [query, ...(aiSearch.ai_intent.expanded_terms || [])];
            const orQuery = terms
              .map((t) => `content.ilike.%${t.replace(/[,"%]/g, "")}%`)
              .join(",");
            const { data: pData } = await supabase
              .from("posts")
              .select("*, profiles!posts_user_id_fkey(*)")
              .or(orQuery)
              .order("created_at", { ascending: false })
              .limit(10);
            setSearchPosts((pData ?? []) as Post[]);
          } else {
            setSearchPosts([]);
          }
        } else {
          const [pRes, postRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("*")
              .or(
                `username.ilike.%${query.replace(/[,"%]/g, "")}%,display_name.ilike.%${query.replace(/[,"%]/g, "")}%`,
              )
              .limit(5),
            supabase
              .from("posts")
              .select("*, profiles!posts_user_id_fkey(*)")
              .ilike("content", `%${query}%`)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);
          setSearchProfiles((pRes.data ?? []) as Profile[]);
          setSearchPosts((postRes.data ?? []) as Post[]);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, profile]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Explore</h1>
      </div>

      {/* Search Bar */}
      <div className="px-5 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Matisa..."
          icon={<Search size={18} />}
          className="h-12 rounded-full border-none bg-[var(--color-surface-2)]"
        />
      </div>

      {/* Categories */}
      <div className="px-5 mb-6">
        <Tabs
          variant="pill"
          activeTab={activeCategory}
          onChange={setActiveCategory}
          tabs={CATEGORIES}
        />
      </div>

      <div className="flex-1 px-5">
        {searchLoading || loadingDisc ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-[var(--color-surface-2)] animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-[var(--color-surface-2)] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="space-y-6">
            {searchProfiles.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Profiles
                </h3>
                <div className="flex flex-col gap-3">
                  {searchProfiles.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/profile/${p.id}`)}
                      className="flex items-center gap-3 bg-[var(--color-surface-2)] p-3 rounded-[20px] cursor-pointer"
                    >
                      <Avatar
                        size={48}
                        profile={{
                          id: p.id,
                          display_name: p.display_name || p.username,
                          avatar_url: p.avatar_url || "",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">
                          {p.display_name || p.username}
                        </p>
                        <p className="text-[var(--color-text-muted)] text-xs truncate">
                          @{p.username}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-4 text-[11px] font-bold"
                      >
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {searchPosts.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 mt-6">
                  Notes
                </h3>
                <div className="flex flex-col gap-3">
                  {searchPosts.map((post) => (
                    <Card key={post.id} variant="solid" className="p-4">
                      <p className="text-white text-sm">{post.content}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchProfiles.length === 0 && searchPosts.length === 0 && (
              <div className="text-center text-[var(--color-text-muted)] text-sm mt-10">
                No results found for "{query}".
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Curated/Discovery Sections when not searching */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] p-6 mb-6">
              <div className="relative z-10">
                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-2 inline-block backdrop-blur-md">
                  Trending
                </span>
                <h2 className="text-white font-bold text-xl mb-1 leading-tight">
                  Windhoek Creator Meetup
                </h2>
                <p className="text-white/80 text-sm mb-4">
                  Join the biggest gathering of musicians and creators.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-white text-black hover:bg-white/90"
                >
                  Join Room
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Trending Creators
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Avatar
                      size={64}
                      profile={{
                        id: `${i}`,
                        display_name: `User ${i}`,
                        avatar_url: `https://i.pravatar.cc/150?u=${i}`,
                      }}
                    />
                    <span className="text-xs text-white font-bold">Creator {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Discovery;
