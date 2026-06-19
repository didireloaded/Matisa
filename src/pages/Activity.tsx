import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PremiumEmptyState as EmptyState } from "@/components/common/PremiumEmptyState";
import { timeAgo } from "@/lib/utils";
import type { AppNotification } from "@/types";
import { DiscoveryAI } from "@/services/ai";
import { Avatar } from "@/components/common/Avatar";
import { Tabs } from "@/components/ui/Tabs";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  like: { icon: <Heart size={14} />, color: "#FF416C", label: "liked your note" },
  follow: { icon: <UserPlus size={14} />, color: "#8B5CF6", label: "started following you" },
  comment: { icon: <MessageCircle size={14} />, color: "#00E5FF", label: "replied to your note" },
  mention: { icon: <AtSign size={14} />, color: "#F59E0B", label: "mentioned you" },
  default: { icon: <Sparkles size={14} />, color: "#8B5CF6", label: "interacted with you" },
};

export function Activity() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

    if (profile) {
      loadNotifs();

      const subscription = supabase
        .channel(`public:notifications:recipient_id=eq.${profile.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${profile.id}`,
          },
          (payload) => {
            // Re-fetch to get joined profile data easily
            loadNotifs();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Activity</h1>
        <button className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-white hover:bg-[var(--color-surface-3)] transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "mentions", label: "Mentions" },
            { id: "follows", label: "Follows" },
          ]}
        />
      </div>

      <div className="flex-1 px-5">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-[var(--color-surface-2)] animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-[var(--color-surface-2)] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Bell}
              title="All caught up!"
              description="When people interact with you or your notes, you'll see it here."
              glowColor="primary"
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {notifications.map((notif, i) => {
              const actor = notif.profiles as any;
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-[var(--color-surface-2)] rounded-[20px] relative overflow-hidden group"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-[${config.color}]`}
                    style={{ backgroundColor: config.color }}
                  />

                  <div className="relative shrink-0 pl-1">
                    <Avatar
                      size={48}
                      profile={{
                        id: actor?.id || "unknown",
                        display_name: actor?.display_name || "User",
                        avatar_url: actor?.avatar_url || "",
                      }}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--color-surface-2)] text-white shadow-sm"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[14px] text-white/90 leading-snug">
                      <span className="font-bold text-white">{actor?.display_name || "User"}</span>{" "}
                      {config.label}
                    </p>
                    <span className="text-[11px] font-bold text-[var(--color-text-muted)] mt-1 block uppercase tracking-wider">
                      {timeAgo(notif.created_at || new Date().toISOString())}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Activity;
