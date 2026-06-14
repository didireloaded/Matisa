import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePushNotifications() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    // Subscribe to new notifications for the current user
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${profile.id}`,
        },
        async (payload) => {
          const newNotif = payload.new;

          // Don't notify if the user triggered it themselves (e.g. self like)
          if (newNotif.actor_id === profile.id) return;

          // Fetch actor details to show in the toast
          const { data: actor } = await supabase
            .from("profiles")
            .select("display_name, username, avatar_url")
            .eq("id", newNotif.actor_id)
            .single();

          const name = actor?.display_name || actor?.username || "Someone";

          let actionText = "interacted with you";
          switch (newNotif.type) {
            case "like":
              actionText = "liked your post ❤️";
              break;
            case "comment":
              actionText = "commented on your post 💬";
              break;
            case "follow":
              actionText = "started following you 👤";
              break;
            case "mention":
              actionText = "mentioned you ✨";
              break;
          }

          toast.success(`${name} ${actionText}`, {
            duration: 4000,
            icon: actor?.avatar_url ? (
              <img src={actor.avatar_url} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              "🔔"
            ),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);
}
