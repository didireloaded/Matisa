import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface BadgeProps extends HTMLMotionProps<"span"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "live" | "glass";
  size?: "sm" | "md";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "primary", size = "sm", className = "", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-full uppercase tracking-wider";

    const variants = {
      primary: "bg-[var(--color-primary)] text-white",
      secondary: "bg-[var(--color-surface-3)] text-white",
      outline: "border border-[var(--color-border)] text-[var(--color-text-muted)]",
      ghost: "bg-white/5 text-white",
      glass: "bg-white/10 backdrop-blur-md border border-white/10 text-white",
      live: "bg-[var(--color-error)] text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse",
    };

    const sizes = {
      sm: "h-5 px-2 text-[10px]",
      md: "h-6 px-2.5 text-[11px]",
    };

    const classes = [baseStyles, variants[variant], sizes[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.span ref={ref} className={classes} {...props}>
        {children}
      </motion.span>
    );
  },
);

Badge.displayName = "Badge";
