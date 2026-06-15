import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { timeAgo } from "@/types";
import type { AppNotification } from "@/types";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { DiscoveryAI } from "@/services/ai";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  like: { icon: <Heart size={14} />, color: "#FF9D2E", label: "liked your post" },
  follow: { icon: <UserPlus size={14} />, color: "#A855F7", label: "started following you" },
  comment: { icon: <MessageCircle size={14} />, color: "#2D7DD2", label: "commented on your post" },
  mention: { icon: <AtSign size={14} />, color: "#FF6B6B", label: "mentioned you" },
  default: { icon: <Sparkles size={14} />, color: "#FF9D2E", label: "interacted with you" }
};

export function Activity() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile) {
      DiscoveryAI.getRecommendedUsers(profile.id).then(users => {
        if (users) {
          setRecommendedIds(new Set(users.map((u: any) => u.id)));
        }
      }).catch(console.error);
    }
  }, [profile]);

  useEffect(() => {
    async function loadNotifs() {
      if (!profile) return;
      const { data } = await supabase
        .from("notifications")
        .select("*, profiles:actor_id(*)")
        .eq("recipient_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (data) setNotifications(data as AppNotification[]);
      setLoading(false);
    }

    // Delay load to allow nice entry animation
    setTimeout(loadNotifs, 300);
  }, [profile]);

  return (
    <div className="pb-28 min-h-full relative">
      <div className="px-4 pt-4 pb-4 sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <h1 className="text-white text-2xl mb-1 font-extrabold tracking-tight flex items-center gap-2">
          Activity
          {notifications.some((n) => !n.is_read) && (
            <span className="w-2 h-2 rounded-full bg-[#FF9D2E] animate-pulse" />
          )}
        </h1>
        <p className="text-white/40 text-sm">What's happening with your content</p>
      </div>

      <main className="px-4">
        {loading ? (
          <div className="space-y-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center py-3 border-b border-white/5">
                <div className="h-11 w-11 rounded-full bg-white/5 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded" />
                  <div className="h-3 w-1/4 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-12">
            <PremiumEmptyState
              icon={Bell}
              title="No activity yet"
              description="When someone interacts with your posts, you'll see it here."
              glowColor="primary"
            />
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notif, i) => {
              const actor =
                (Array.isArray(notif.profiles) ? notif.profiles[0] : notif.profiles) || {};
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;
              const isPriority = actor.id ? recommendedIds.has(actor.id) : false;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-start gap-3 py-3 cursor-pointer mb-1 ${
                    isPriority 
                      ? "bg-[#FF9D2E]/10 px-3 rounded-2xl border border-[#FF9D2E]/30 shadow-[0_0_15px_rgba(255,157,46,0.1)]" 
                      : !notif.is_read 
                        ? "bg-white/5 px-3 rounded-2xl border border-transparent" 
                        : "border-b border-white/5"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden">
                      <ImageWithFallback 
                         src={actor.avatar_url || ""} 
                         alt={actor.display_name || actor.username || "User"} 
                         className="w-full h-full object-cover" 
                      />
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B0B0B]"
                      style={{ background: config.color }}
                    >
                      <span style={{ color: "white" }}>{config.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white/80 text-sm leading-snug">
                        <span style={{ fontWeight: 600 }}>{actor.display_name || actor.username || "Someone"}</span>{" "}
                        <span className="text-white/50">{config.label}</span>
                      </p>
                      {isPriority && (
                        <div className="flex items-center gap-1 bg-[#FF9D2E]/20 text-[#FF9D2E] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                          <Sparkles size={8} /> Priority
                        </div>
                      )}
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">{timeAgo(notif.created_at || new Date().toISOString())}</p>
                  </div>
                  {notif.type === "follow" && (
                    <button
                      className="px-3 py-1 rounded-full text-xs flex-shrink-0 transition hover:opacity-80"
                      style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7" }}
                    >
                      Follow back
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
