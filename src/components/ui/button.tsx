import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]",
      secondary: "bg-[var(--color-surface-3)] text-white hover:bg-[var(--color-surface-2)]",
      outline:
        "border-2 border-[var(--color-border)] text-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
      ghost: "text-white hover:bg-[var(--color-surface-3)]",
      glass: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs rounded-full",
      md: "h-12 px-6 text-sm rounded-full",
      lg: "h-14 px-8 text-base rounded-full",
      icon: "h-12 w-12 rounded-full",
    };

    const classes = [
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.button
        ref={ref}
        whileTap={!disabled && !isLoading ? { scale: 0.96 } : {}}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
