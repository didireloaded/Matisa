import { motion } from "motion/react";
import { Heart, UserPlus, MessageCircle, AtSign } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { ACTIVITY, USERS } from "./data";

function getUserById(id: string) {
  return USERS.find((u) => u.id === id) || USERS[0];
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  like: { icon: <Heart size={14} />, color: "#FF9D2E", label: "liked" },
  follow: { icon: <UserPlus size={14} />, color: "#A855F7", label: "followed you" },
  comment: { icon: <MessageCircle size={14} />, color: "#2D7DD2", label: "commented on" },
  mention: { icon: <AtSign size={14} />, color: "#FF6B6B", label: "mentioned you in" },
};

export function ActivityPage() {
  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pt-4 pb-4">
        <h1
          className="text-white text-2xl mb-1"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Activity
        </h1>
        <p className="text-white/40 text-sm">What's happening with your content</p>
      </div>

      <div className="px-4 space-y-1">
        {ACTIVITY.map((item, i) => {
          const user = getUserById(item.userId);
          const config = TYPE_CONFIG[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 py-3 border-b border-white/5"
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0B0B0B]"
                  style={{ background: config.color }}
                >
                  <span style={{ color: "white" }}>{config.icon}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm leading-snug">
                  <span style={{ fontWeight: 600 }}>{user.name}</span>{" "}
                  <span className="text-white/50">{config.label}</span>{" "}
                  {item.target && <span className="text-white/50">{item.target}</span>}
                </p>
                {item.content && (
                  <p className="text-white/40 text-xs mt-1 line-clamp-1">"{item.content}"</p>
                )}
                <p className="text-white/30 text-xs mt-0.5">{item.time} ago</p>
              </div>
              {item.type === "follow" && (
                <button
                  className="px-3 py-1 rounded-full text-xs flex-shrink-0"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7" }}
                >
                  Follow back
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
