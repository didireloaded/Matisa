import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  ariaLabel,
  type = "button",
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:grayscale ${className}`}
    >
      {loading && (
        <Loader2 className="absolute left-2 w-4 h-4 animate-spin" />
      )}
      <span className={loading ? "opacity-0" : undefined}>{children}</span>
    </motion.button>
  );
}
