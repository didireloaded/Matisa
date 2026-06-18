import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { KaraokeService } from "@/services/karaoke";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { Mic, Plus, Loader2 } from "lucide-react";

interface QueueItem {
  id: string;
  user_id: string;
  song_title: string;
  song_artist: string;
  status: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function KaraokeQueue({ roomId }: { roomId: string }) {
  const { profile } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchQueue = async () => {
      try {
        const data = await KaraokeService.fetchQueue(roomId);
        if (mounted) setQueue(data as any[]);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchQueue();

    const channel = supabase
      .channel(`queue:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "karaoke_queue", filter: `room_id=eq.${roomId}` },
        () => {
          fetchQueue();
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="bg-[#1C1814] rounded-2xl border border-[#2E2822] overflow-hidden">
      <div className="p-4 border-b border-[#2E2822] flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#C8521A]" /> Up Next
        </h3>
        <span className="text-xs text-[#8A7F74]">{queue.length} in queue</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar p-2">
        {queue.length === 0 ? (
          <div className="py-8 text-center text-[#8A7F74] text-sm">
            Queue is empty.
            <br />
            Be the first to sing!
          </div>
        ) : (
          queue.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group"
            >
              <span className="text-[#8A7F74] text-xs font-mono w-4">{i + 1}</span>
              <Avatar
                profile={{
                  id: item.user_id,
                  display_name: item.profiles.display_name,
                  avatar_url: item.profiles.avatar_url,
                }}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {item.profiles.display_name}
                </div>
                <div className="text-xs text-[#8A7F74] truncate">
                  {item.song_title
                    ? `${item.song_title} - ${item.song_artist}`
                    : "Selecting song..."}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-[#13110E] border-t border-[#2E2822]">
        <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition">
          <Plus className="w-4 h-4" /> Join Queue
        </button>
      </div>
    </div>
  );
}
