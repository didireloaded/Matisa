import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, Skeleton } from "@/components/common";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { timeAgo } from "@/types";
import type { AppNotification } from "@/types";

export function Activity() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Map notification types to specific icons and colors
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "like":
        return {
          icon: Heart,
          color: "text-secondary",
          bgColor: "bg-secondary/10",
          borderColor: "border-secondary/20",
        };
      case "comment":
        return {
          icon: MessageCircle,
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/20",
        };
      case "follow":
        return {
          icon: UserPlus,
          color: "text-accent1",
          bgColor: "bg-accent1/10",
          borderColor: "border-accent1/20",
        };
      case "mention":
        return {
          icon: AtSign,
          color: "text-accent2",
          bgColor: "bg-accent2/10",
          borderColor: "border-accent2/20",
        };
      default:
        return {
          icon: Sparkles,
          color: "text-accent3",
          bgColor: "bg-accent3/10",
          borderColor: "border-accent3/20",
        };
    }
  };

  return (
    <div className="pb-28 min-h-full text-foreground relative">
      <header className="sticky top-0 z-40 px-6 pt-4 pb-4 bg-background/80 backdrop-blur-3xl border-b border-border/50">
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-foreground flex items-center gap-3">
          Activity
          {notifications.some((n) => !n.is_read) && (
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </h1>
      </header>

      <main className="pt-4">
        {loading ? (
          <div className="px-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center p-3">
                <Skeleton className="h-12 w-12 rounded-full bg-card/50" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-card/50" />
                  <Skeleton className="h-3 w-1/4 bg-card/50" />
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
          <div className="flex flex-col">
            {notifications.map((notif) => {
              const actor =
                (Array.isArray(notif.profiles) ? notif.profiles[0] : notif.profiles) || {};
              const { icon: TypeIcon, color, bgColor, borderColor } = getTypeConfig(notif.type);

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer border-b border-border/50 hover:bg-card/50 ${!notif.is_read ? "bg-card/30 relative" : ""}`}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}

                  <div className="relative">
                    <Avatar profile={actor} size={48} />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background ${bgColor} ${borderColor}`}
                    >
                      <TypeIcon size={12} className={color} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[15px] text-foreground leading-snug">
                      <span className="font-bold">
                        {actor.display_name || actor.username || "Someone"}
                      </span>{" "}
                      {notif.type === "like"
                        ? "liked your post"
                        : notif.type === "comment"
                          ? "commented on your post"
                          : notif.type === "follow"
                            ? "started following you"
                            : notif.type === "mention"
                              ? "mentioned you"
                              : `interacted with you`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {timeAgo(notif.created_at || new Date().toISOString())}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
