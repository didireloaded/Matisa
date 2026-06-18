import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isVerified?: boolean;
  isOnline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "Avatar",
      size = "md",
      isVerified = false,
      isOnline = false,
      className = "",
      onClick,
    },
    ref,
  ) => {
    const sizes = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-20 h-20",
      "2xl": "w-28 h-28",
    };

    const fallbackSeed = alt.replace(/\s+/g, "");
    const imageSrc = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`;

    return (
      <div
        ref={ref}
        className={`relative inline-block ${sizes[size]} ${className}`}
        onClick={onClick}
      >
        <motion.div
          whileTap={onClick ? { scale: 0.95 } : {}}
          className={`w-full h-full rounded-full overflow-hidden bg-[var(--color-surface-2)] border-[1.5px] border-[var(--color-surface)] ${onClick ? "cursor-pointer" : ""}`}
        >
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
            }}
          />
        </motion.div>

        {isOnline && (
          <div className="absolute bottom-0 right-0 w-[22%] h-[22%] min-w-[10px] min-h-[10px] bg-[var(--color-success)] rounded-full border-[2px] border-[var(--color-background)]" />
        )}

        {isVerified && (
          <div className="absolute bottom-0 right-[-4px] w-5 h-5 bg-[var(--color-primary)] rounded-full border-[2px] border-[var(--color-background)] flex items-center justify-center shadow-sm">
            <Check size={10} strokeWidth={4} className="text-white" />
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
