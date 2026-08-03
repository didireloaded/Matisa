import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Sparkles, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/common/Avatar";
import { USERS } from "@/data/dummy";

export function Activity() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mentions" | "reactions" | "voicemails">(
    "all",
  );

  useEffect(() => {
    async function loadNotifs() {
      if (!profile) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*, profiles:actor_id(*)")
          .eq("recipient_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(30);

        if (data && data.length > 0) {
          setNotifications(data);
        } else {
          // Dummy notification fallbacks
          setNotifications([
            {
              id: "n-1",
              type: "like",
              created_at: new Date().toISOString(),
              profiles: {
                id: USERS[0].id,
                display_name: USERS[0].name,
                username: USERS[0].username,
                avatar_url: USERS[0].avatar,
              },
              content: "liked your Note",
            },
            {
              id: "n-2",
              type: "follow",
              created_at: new Date(Date.now() - 7200000).toISOString(),
              profiles: {
                id: USERS[1].id,
                display_name: USERS[1].name,
                username: USERS[1].username,
                avatar_url: USERS[1].avatar,
              },
              content: "started following you",
            },
            {
              id: "n-3",
              type: "voicemail",
              created_at: new Date(Date.now() - 14400000).toISOString(),
              profiles: {
                id: USERS[2].id,
                display_name: USERS[2].name,
                username: USERS[2].username,
                avatar_url: USERS[2].avatar,
              },
              content: "left you a 0:35 Voicemail",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifs();
  }, [profile]);

  const categories = [
    { id: "all", label: "All Activity" },
    { id: "mentions", label: "Mentions" },
    { id: "reactions", label: "Reactions" },
    { id: "voicemails", label: "Voicemails" },
  ];

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2">
      {/* Header */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Notifications & Activity</h1>
          <p className="text-xs text-white/50 mt-0.5">Recent interactions with your profile</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-[#24A3C7]">
          <Bell size={19} />
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="mb-5 overflow-x-auto no-scrollbar px-5 flex gap-2">
        {categories.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? "bg-[#24A3C7]/20 text-[#39B7F2] border border-[#24A3C7]/40 shadow-[0_0_12px_rgba(36,163,199,0.2)]"
                  : "glass-panel text-white/50 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Notifications Feed */}
      <div className="px-5 flex-1 space-y-2.5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-[#24A3C7] border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-[24px]">
            <Bell size={32} className="mx-auto mb-2 text-white/30" />
            <p className="text-xs text-white/50">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const actor = notif.profiles || USERS[0];
            return (
              <motion.div
                key={notif.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between glass-panel p-3.5 rounded-[22px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar
                      size={44}
                      profile={{
                        id: actor.id,
                        display_name: actor.display_name || actor.name,
                        avatar_url: actor.avatar_url || actor.avatar || "",
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9D2E] text-black">
                      <Heart size={9} fill="black" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white leading-snug">
                      <span className="font-bold">
                        {actor.display_name || actor.full_name || actor.username || actor.name}
                      </span>{" "}
                      <span className="text-white/70">
                        {notif.message || notif.content || "interacted with your profile"}
                      </span>
                    </p>
                    <span className="text-[10px] text-[#24A3C7] font-semibold mt-0.5 block">
                      {timeAgo(notif.created_at || new Date().toISOString())}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Activity;
