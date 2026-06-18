import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: "solid" | "glass" | "elevated" | "outline";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "solid", padding = "md", className = "", ...props }, ref) => {
    const baseStyles = "rounded-[24px] overflow-hidden transition-all duration-200";

    const variants = {
      solid: "bg-[var(--color-surface)] border border-[var(--color-border)]",
      glass: "bg-white/5 backdrop-blur-xl border border-white/10",
      elevated:
        "bg-[var(--color-surface-2)] shadow-2xl shadow-black/50 border border-[var(--color-border)]",
      outline: "bg-transparent border-2 border-[var(--color-border)]",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    };

    const classes = [baseStyles, variants[variant], paddings[padding], className]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.div ref={ref} className={classes} {...props}>
        {children}
      </motion.div>
    );
  },
);

Card.displayName = "Card";
