import { useFollow } from "@/hooks/useFollow";

export function FollowButton({ 
  userId, 
  className, 
  variant = "primary" 
}: { 
  userId: string, 
  className?: string, 
  variant?: "primary" | "secondary" | "glass" 
}) {
  const { isFollowing, toggleFollow, loading } = useFollow(userId);

  const baseStyle = className || "px-4 py-1.5 rounded-full text-xs font-bold transition hover:opacity-80";
  
  const getVariantStyle = () => {
    if (variant === "glass") {
      return isFollowing ? "bg-white/10 text-white" : "bg-[#FF9D2E]/10 text-[#FF9D2E]";
    }
    if (variant === "secondary") {
      return isFollowing ? "bg-[#151515] border border-white/10 text-white/70" : "bg-gradient-to-r from-[#FF9D2E] to-[#FF6B35] text-black";
    }
    // primary
    return isFollowing ? "bg-[#151515] border border-white/10 text-white/70" : "bg-[#A855F7] text-white";
  };

  return (
    <button 
      onClick={(e) => { 
        e.stopPropagation(); 
        toggleFollow(); 
      }} 
      disabled={loading}
      className={`${baseStyle} ${getVariantStyle()}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
