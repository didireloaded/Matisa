import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Flame, Smile, Send, Bookmark } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { USERS, STORIES, NOTES } from "./data";

function getUserById(id: string) {
  return USERS.find((u) => u.id === id) || USERS[0];
}

function timeAgo(t: string) {
  return t;
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
    <div className="px-4 py-3">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {/* Add story */}
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
              <span className="text-[10px] text-white/70 truncate w-14 text-center">
                {user.name.split(" ")[0]}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function NoteCard({ note, onLike }: { note: (typeof NOTES)[0]; onLike: (id: string) => void }) {
  const user = getUserById(note.userId);
  const [liked, setLiked] = useState(false);
  const [fired, setFired] = useState(false);
  const [laughed, setLaughed] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-[20px] overflow-hidden border border-white/5"
      style={{
        background: `linear-gradient(135deg, ${note.gradient.replace("from-[", "").replace("]", "").replace(" to-[", ", ").replace("]", "")})`,
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <ImageWithFallback
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {user.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FF9D2E] rounded-full flex items-center justify-center">
                <span className="text-[8px] text-black font-bold">✓</span>
              </div>
            )}
          </div>
          <div>
            <div className="text-white/90 text-sm leading-none mb-1">{user.name}</div>
            <div className="text-white/40 text-[11px]">
              @{user.username} · {note.time} ago
            </div>
          </div>
        </div>

        <p className="text-white text-[15px] leading-relaxed mb-4">{note.content}</p>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-1.5"
          >
            <Heart
              size={17}
              className={liked ? "fill-[#FF9D2E] text-[#FF9D2E]" : "text-white/50"}
            />
            <span className="text-[12px] text-white/50">{note.likes + (liked ? 1 : 0)}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setFired(!fired)}
            className="flex items-center gap-1.5"
          >
            <Flame
              size={17}
              className={fired ? "fill-orange-500 text-orange-500" : "text-white/50"}
            />
            <span className="text-[12px] text-white/50">{note.fire + (fired ? 1 : 0)}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setLaughed(!laughed)}
            className="flex items-center gap-1.5"
          >
            <Smile
              size={17}
              className={laughed ? "fill-yellow-400 text-yellow-400" : "text-white/50"}
            />
            <span className="text-[12px] text-white/50">{note.laugh + (laughed ? 1 : 0)}</span>
          </motion.button>
          <div className="flex-1" />
          <motion.button whileTap={{ scale: 0.85 }}>
            <MessageCircle size={17} className="text-white/50" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setSaved(!saved)}>
            <Bookmark
              size={17}
              className={saved ? "fill-[#A855F7] text-[#A855F7]" : "text-white/50"}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface HomePageProps {
  onStoryView: (userId: string) => void;
}

export function HomePage({ onStoryView }: HomePageProps) {
  const [notes, setNotes] = useState(NOTES);

  return (
    <div className="min-h-full pb-28">
      <Stories onStoryClick={onStoryView} />

      <div className="px-4 py-2 mb-1">
        <div className="flex items-center gap-2 text-white/40 text-[11px] uppercase tracking-widest">
          <span>✦</span>
          <span>Latest Notes</span>
        </div>
      </div>

      <div>
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <NoteCard note={note} onLike={(id) => {}} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
