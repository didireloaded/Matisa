// src/pages/Notifications.tsx
import { useState, useEffect, useCallback } from "react";
import { Heart, MessageCircle, UserPlus, Radio, Calendar, AtSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SkeletonList } from "@/components/common/SkeletonLoader";

const DEMO_NOTIFICATIONS = [
  {
    id: "demo-1",
    type: "like",
    icon: Heart,
    iconColor: "text-red-400",
    bgColor: "bg-red-400/10",
    text: "Hanna Dowie liked your note",
    time: "2m ago",
    read: false,
  },
  {
    id: "demo-2",
    type: "reply",
    icon: MessageCircle,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-400/10",
    text: "Jason Mutonga replied to your note",
    time: "15m ago",
    read: false,
  },
  {
    id: "demo-3",
    type: "follow",
    icon: UserPlus,
    iconColor: "text-green-400",
    bgColor: "bg-green-400/10",
    text: "Silas Vibe started following you",
    time: "1h ago",
    read: true,
  },
  {
    id: "demo-4",
    type: "room",
    icon: Radio,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-400/10",
    text: "Afro-pop Jam Session is now live",
    time: "2h ago",
    read: true,
  },
  {
    id: "demo-5",
    type: "event",
    icon: Calendar,
    iconColor: "text-orange-400",
    bgColor: "bg-orange-400/10",
    text: "Windhoek Street Food Festival starts in 1 hour",
    time: "3h ago",
    read: true,
  },
  {
    id: "demo-6",
    type: "mention",
    icon: AtSign,
    iconColor: "text-teal-400",
    bgColor: "bg-teal-400/10",
    text: "Maria Theodore mentioned you in a note",
    time: "5h ago",
    read: true,
  },
];

export default function Notifications() {
  const { session, profile } = useAuth();
  const [realNotifs, setRealNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUserId = session?.user?.id || profile?.id;

  const fetchNotifs = useCallback(async () => {
    if (!activeUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("id, recipient_id, actor_id, type, title, message, read, created_at")
        .eq("recipient_id", activeUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRealNotifs(data || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const markAllRead = async () => {
    if (!activeUserId) return;
    try {
      await supabase.from("notifications").update({ read: true }).eq("recipient_id", activeUserId);
      setRealNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const activeNotifs = realNotifs.length > 0 ? realNotifs : DEMO_NOTIFICATIONS;

  return (
    <div className="min-h-screen bg-[#06101D] text-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#06101D]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center justify-between h-11">
          <h1 className="text-white font-bold text-xl tracking-wide font-display">Activity</h1>
          <button
            onClick={markAllRead}
            className="text-[#24A3C7] text-xs font-bold hover:underline transition"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-4 space-y-1 pt-2">
        {loading ? (
          <SkeletonList />
        ) : (
          activeNotifs.map((notif) => {
            const isRead = notif.read;
            const textContent = notif.message || notif.title || notif.text;
            const timeAgo = notif.created_at
              ? new Date(notif.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : notif.time || "Recently";

            return (
              <div
                key={notif.id}
                className={`w-full flex items-start gap-3 py-3 px-3 rounded-2xl border-b border-white/[0.04] transition ${
                  !isRead ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#24A3C7]/20 text-[#24A3C7] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#24A3C7]/30">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-xs leading-relaxed font-medium">{textContent}</p>
                  <p className="text-white/40 text-[10px] mt-1 font-mono">{timeAgo}</p>
                </div>
                {!isRead && (
                  <div className="w-2 h-2 bg-[#24A3C7] rounded-full mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
