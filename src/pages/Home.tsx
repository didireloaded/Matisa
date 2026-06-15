import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Flame, Smile, Send, Bookmark, Navigation, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { USERS, STORIES } from "@/data/dummy";
import { supabase } from "@/lib/supabase";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { Avatar } from "@/components/common/Avatar";
import type { Profile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { DiscoveryAI } from "@/services/ai";
import { SetMoodModal } from "@/components/profile/SetMoodModal";

interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

function getUserById(id: string) {
  return USERS.find((u) => u.id === id) || USERS[0];
}

function StoryRing({ hasNew }: { hasNew: boolean }) {
  if (!hasNew) return <div className="absolute inset-0 rounded-full border-2 border-white/10" />;
  return (
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: "conic-gradient(from 120deg, #FF9D2E, #FF6B6B, #A855F7, #FF9D2E)",
        padding: "2.5px",
        borderRadius: "9999px",
      }}
    />
  );
}

function Stories({ onStoryClick }: { onStoryClick: (userId: string) => void }) {
  return (
    <div className="px-4 py-3 border-b border-white/5 bg-background">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="relative w-[62px] h-[62px]">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20" />
            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-[#FF9D2E] text-2xl leading-none">+</span>
            </div>
          </div>
          <span className="text-[10px] text-white/50 truncate w-14 text-center">Your story</span>
        </div>
        {STORIES.map((story) => {
          const user = getUserById(story.userId);
          return (
            <motion.div
              key={story.id}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              onClick={() => onStoryClick(story.userId)}
            >
              <div className="relative w-[62px] h-[62px]">
                <StoryRing hasNew={story.hasNew} />
                <div className="absolute inset-[3px] rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] text-white/70 truncate w-14 text-center">{user.name.split(" ")[0]}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const [reacted, setReacted] = useState<string | null>(null);

  const GRADIENTS = [
    ["#1a1a2e", "#16213e"],
    ["#2d1b00", "#1a0f00"],
    ["#1a0a00", "#2d1500"],
    ["#1a001a", "#0d000d"],
    ["#001a0d", "#000d07"],
  ];
  const from = GRADIENTS[note.id.charCodeAt(0) % GRADIENTS.length][0];
  const to = GRADIENTS[note.id.charCodeAt(0) % GRADIENTS.length][1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-[20px] overflow-hidden border border-white/5"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            profile={{
              id: note.profiles?.id || "unknown",
              display_name: note.profiles?.display_name || note.profiles?.username || "User",
              avatar_url: note.profiles?.avatar_url || "",
            }}
            size={36}
          />
          <div>
            <div className="text-white/90 text-sm leading-none mb-1 font-bold">
              {note.profiles?.display_name || note.profiles?.username || "User"}
            </div>
            <div className="text-white/40 text-[11px]">
              @{note.profiles?.username || "user"} · {new Date(note.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <p className="text-white text-[15px] leading-relaxed mb-4">{note.content}</p>

        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setReacted(reacted === "heart" ? null : "heart")} className="flex items-center gap-1.5">
            <Heart size={17} className={reacted === "heart" ? "fill-[#FF9D2E] text-[#FF9D2E]" : "text-white/50"} />
            <span className="text-[12px] text-white/50">{reacted === "heart" ? 1 : 0}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setReacted(reacted === "fire" ? null : "fire")} className="flex items-center gap-1.5">
            <Flame size={17} className={reacted === "fire" ? "fill-orange-500 text-orange-500" : "text-white/50"} />
            <span className="text-[12px] text-white/50">{reacted === "fire" ? 1 : 0}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setReacted(reacted === "laugh" ? null : "laugh")} className="flex items-center gap-1.5">
            <Smile size={17} className={reacted === "laugh" ? "fill-yellow-400 text-yellow-400" : "text-white/50"} />
            <span className="text-[12px] text-white/50">{reacted === "laugh" ? 1 : 0}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function Home() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoodModal, setShowMoodModal] = useState(false);

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
    <div className="min-h-full pb-28 flex flex-col">
      <SetMoodModal isOpen={showMoodModal} onClose={() => setShowMoodModal(false)} currentMood={profile?.mood} />

      <Stories onStoryClick={(id) => toast("Opening story for user " + id)} />

      {/* Set Vibe Banner */}
      <div className="px-4 py-2">
        <button 
          onClick={() => setShowMoodModal(true)}
          className="w-full bg-[#151515] border border-white/5 rounded-2xl p-3 flex items-center justify-between transition active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Smile className="w-4 h-4 text-[#FF9D2E]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-white">Set Your Vibe</span>
              <span className="text-xs text-white/40">{profile?.mood || "What's the move today?"}</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/50">Update</div>
        </button>
      </div>

      <div className="px-4 py-3 mb-1">
        <div className="flex items-center justify-between text-white/40 text-[11px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <span className="text-[#FF9D2E]">✦</span>
            <span>Latest Notes</span>
          </div>
          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/30">24H</span>
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF9D2E] border-t-transparent animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <PremiumEmptyState
            icon={AlignLeft}
            title="No Notes Yet"
            description="Be the first to drop a note for the community."
            glowColor="primary"
          />
        ) : (
          <div>
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
