import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/common/Avatar";
import { Heart, Flame, Smile, AlignLeft } from "lucide-react";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import type { Profile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { DiscoveryAI } from "@/services/ai";

interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

function NoteCard({ note }: { note: Note }) {
  const [reacted, setReacted] = useState<string | null>(null);

  const handleReact = (type: string) => {
    setReacted(reacted === type ? null : type);
  };

  return (
    <div className="bg-card rounded-3xl p-5 border border-border break-inside-avoid mb-4 relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] opacity-50" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          profile={{
            id: note.profiles?.id || "unknown",
            display_name: note.profiles?.display_name || note.profiles?.username || "User",
            avatar_url: note.profiles?.avatar_url || "",
          }}
          size={40}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-sm leading-tight">
              {note.profiles?.display_name || note.profiles?.username}
            </span>
          </div>
          <span className="text-[#A0A0A0] text-[10px]">
            {new Date(note.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-white text-xl font-medium leading-snug mb-5 font-display tracking-tight">
        {note.content}
      </p>

      {/* Reactions Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleReact("heart")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === "heart"
              ? "bg-secondary/20 text-secondary border border-secondary/30"
              : "bg-background text-muted-foreground hover:text-white border border-transparent"
          }`}
        >
          <Heart size={14} className={reacted === "heart" ? "fill-current" : ""} />
          <span>{(reacted === "heart" ? 1 : 0)}</span>
        </button>
        <button
          onClick={() => handleReact("fire")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === "fire"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-background text-muted-foreground hover:text-white border border-transparent"
          }`}
        >
          <Flame size={14} className={reacted === "fire" ? "fill-current" : ""} />
          <span>{(reacted === "fire" ? 1 : 0)}</span>
        </button>
        <button
          onClick={() => handleReact("laugh")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            reacted === "laugh"
              ? "bg-chart-3/20 text-chart-3 border border-chart-3/30"
              : "bg-background text-muted-foreground hover:text-white border border-transparent"
          }`}
        >
          <Smile size={14} className={reacted === "laugh" ? "fill-current" : ""} />
          <span>{(reacted === "laugh" ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}

export function Notes() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for new notes every 5 seconds or when mounted
  useEffect(() => {
    async function fetchNotes() {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*, profiles(*)")
          .gt("created_at", new Date(Date.now() - 86400000).toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        let fetchedNotes = (data as any[]) || [];
        
        // Invisible AI Ranking
        if (profile) {
          try {
             const recommendedUsers = await DiscoveryAI.getRecommendedUsers(profile.id);
             if (recommendedUsers && recommendedUsers.length > 0) {
               const recommendedIds = new Set(recommendedUsers.map((u: any) => u.id));
               fetchedNotes.sort((a, b) => {
                 const aIsRec = recommendedIds.has(a.user_id) ? 1 : 0;
                 const bIsRec = recommendedIds.has(b.user_id) ? 1 : 0;
                 if (aIsRec !== bIsRec) return bIsRec - aIsRec;
                 return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
               });
             }
          } catch(err) {
             console.error("AI Sort Error", err);
          }
        }

        setNotes(fetchedNotes);
      } catch (e) {
        console.warn("Failed to fetch notes", e);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return (
    <div className="flex flex-col h-[calc(100dvh-54px-60px)] bg-background">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight">Notes</h1>
        <div className="text-[10px] uppercase tracking-wider font-bold text-[#FF9D2E] bg-[#FF9D2E]/10 px-2.5 py-1 rounded-full">
          Disappears in 24h
        </div>
      </div>

      {/* Notes Feed - Masonry Layout */}
      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar pb-28">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF9D2E] border-t-transparent animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <PremiumEmptyState
            icon={AlignLeft}
            title="No Notes Yet"
            description="Be the first to share a quick thought or update with the community."
            glowColor="primary"
          />
        ) : (
          <div className="columns-1 sm:columns-2 gap-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
