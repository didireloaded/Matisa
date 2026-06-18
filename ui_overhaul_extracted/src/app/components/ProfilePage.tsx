import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Link2, Settings, Grid3X3, BookOpen, Heart } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { ME, NOTES, USERS } from "./data";

const TABS = ["Notes", "Media", "Liked"];

const GRID_IMAGES = [
  "https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488197047962-b48492212cda?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1770283553838-769c5f97d55c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1528508670332-4c687dae6295?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1731662784037-9b2f21819caa?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1515581247767-d78687bf2254?w=300&h=300&fit=crop",
];

export function ProfilePage() {
  const [tab, setTab] = useState("Notes");
  const [isFollowing, setIsFollowing] = useState(false);
  const myNotes = NOTES.filter((n) => n.userId === ME.id);

  return (
    <div className="min-h-full pb-28">
      {/* Cover + Avatar */}
      <div className="relative">
        <div
          className="h-36"
          style={{
            background: "linear-gradient(135deg, #1a0a00 0%, #2d0d5a 50%, #0a1a00 100%)",
          }}
        />
        <div className="absolute bottom-0 translate-y-1/2 left-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0B0B0B]">
              <ImageWithFallback
                src={ME.avatar}
                alt={ME.name}
                className="w-full h-full object-cover"
              />
            </div>
            {ME.verified && (
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#FF9D2E] rounded-full flex items-center justify-center border-2 border-[#0B0B0B]">
                <span className="text-[9px] text-black font-bold">✓</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 flex gap-2">
          <button className="px-4 py-1.5 rounded-full bg-[#151515] border border-white/10 text-white/70 text-xs flex items-center gap-1.5">
            <Settings size={12} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <h1
            className="text-white text-xl"
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
          >
            {ME.name}
          </h1>
          {ME.verified && <span className="text-[#FF9D2E] text-sm">✓</span>}
        </div>
        <p className="text-white/40 text-sm mb-2">@{ME.username}</p>
        <p className="text-white/70 text-sm leading-relaxed mb-3">{ME.bio}</p>
        <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {ME.location}
          </span>
          <span className="flex items-center gap-1">
            <Link2 size={11} />
            matisa.na/@{ME.username}
          </span>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-white text-base" style={{ fontWeight: 700 }}>
              {(ME.followers / 1000).toFixed(1)}K
            </p>
            <p className="text-white/40 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white text-base" style={{ fontWeight: 700 }}>
              {ME.following}
            </p>
            <p className="text-white/40 text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="text-white text-base" style={{ fontWeight: 700 }}>
              {myNotes.length}
            </p>
            <p className="text-white/40 text-xs">Notes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-4 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm transition relative"
            style={{
              color: tab === t ? "#FF9D2E" : "rgba(255,255,255,0.4)",
              fontWeight: tab === t ? 700 : 400,
            }}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-7 rounded-full bg-[#FF9D2E]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Notes" && (
        <div className="px-4 space-y-3">
          {myNotes.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <BookOpen size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No notes yet</p>
            </div>
          ) : (
            myNotes.map((note) => (
              <div key={note.id} className="bg-[#151515] rounded-2xl p-4 border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed">{note.content}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-white/30 text-xs flex items-center gap-1">
                    <Heart size={11} />
                    {note.likes}
                  </span>
                  <span className="text-white/30 text-xs">{note.time} ago</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Media" && (
        <div className="px-4">
          <div className="grid grid-cols-3 gap-1">
            {GRID_IMAGES.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="aspect-square rounded-lg overflow-hidden"
              >
                <ImageWithFallback src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === "Liked" && (
        <div className="flex flex-col items-center py-16">
          <Heart size={32} className="text-white/20 mb-3" />
          <p className="text-white/40 text-sm">Liked notes appear here</p>
        </div>
      )}
    </div>
  );
}
