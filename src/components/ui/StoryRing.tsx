import { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../common/Avatar";
import type { ComponentProps } from "react";
type AvatarProps = ComponentProps<typeof Avatar>;

export interface StoryRingProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  avatarProps: AvatarProps;
  hasUnviewed?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  isAddStory?: boolean;
}

export function StoryRing({
  avatarProps,
  hasUnviewed = true,
  onClick,
  size = "md",
  label,
  isAddStory = false,
  className = "",
  ...props
}: StoryRingProps) {
  const sizes = {
    sm: "w-[44px] h-[44px]",
    md: "w-[68px] h-[68px]",
    lg: "w-[84px] h-[84px]",
    xl: "w-[100px] h-[100px]",
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`} {...props}>
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        className={`relative ${sizes[size]} rounded-full flex items-center justify-center p-[2.5px] focus:outline-none`}
        style={
          hasUnviewed && !isAddStory
            ? {
                background:
                  "conic-gradient(from 120deg, var(--color-primary), var(--color-secondary), var(--color-primary-light), var(--color-primary))",
              }
            : { border: "2px solid var(--color-border)" }
        }
      >
        <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[var(--color-background)] bg-[var(--color-surface)]">
          <Avatar {...avatarProps} className="w-full h-full" />
        </div>

        {isAddStory && (
          <div className="absolute bottom-0 right-0 w-[28%] h-[28%] bg-[var(--color-surface-2)] border-2 border-[var(--color-background)] rounded-full flex items-center justify-center text-white font-bold">
            +
          </div>
        )}
      </motion.button>

      {label && (
        <span
          className={`text-[11px] font-medium max-w-[72px] truncate ${hasUnviewed ? "text-white" : "text-[var(--color-text-muted)]"}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
