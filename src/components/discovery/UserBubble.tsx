import { memo } from "react";
import { motion } from "framer-motion";
import { useLongPress } from "@/hooks/useLongPress";
import { useDiscoveryStore } from "@/stores/useDiscoveryStore";
import type { Profile } from "@/types";

interface UserBubbleProps {
  user: Profile;
  cluster?: boolean;
  pointCount?: number;
  onClickCluster?: () => void;
  isRecommended?: boolean;
}

export const UserBubble = memo(function UserBubble({
  user,
  cluster,
  pointCount,
  onClickCluster,
  isRecommended,
}: UserBubbleProps) {
  const setSelectedUserId = useDiscoveryStore((state) => state.setSelectedUserId);

  const handlePress = () => {
    if (user) setSelectedUserId(user.id);
  };

  const handleTap = () => {
    if (user) setSelectedUserId(user.id);
  };

  const longPressProps = useLongPress(handlePress, handleTap);

  if (cluster) {
    return (
      <div
        onClick={onClickCluster}
        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg cursor-pointer shadow-lg shadow-white/20 hover:scale-110 transition-transform"
      >
        +{pointCount}
      </div>
    );
  }

  const baseSize = 50;
  const scoreSize = isRecommended ? 10 : 0; // Make recommended users slightly larger
  const size = baseSize + scoreSize;

  const isCreator = user.is_creator || user.creator_badge;

  return (
    <motion.div
      {...longPressProps}
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" }}
      className={`relative cursor-pointer group ${isRecommended ? "z-10" : "z-0"}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full rounded-full p-[2px] transition-all duration-300 ${
          isRecommended
            ? "bg-primary shadow-[0_0_20px_var(--primary)]"
            : isCreator
              ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-500"
              : user.is_verified
                ? "bg-blue-500"
                : "bg-white/20"
        }`}
      >
        <img
          src={
            user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
          alt={user.display_name || user.username}
          className="w-full h-full rounded-full object-cover border-[3px] border-black bg-black"
        />
      </div>

      {user.online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black bg-green-500 animate-pulse" />
      )}
    </motion.div>
  );
});
