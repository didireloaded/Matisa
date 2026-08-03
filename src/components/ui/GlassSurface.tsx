import type { HTMLAttributes, ReactNode } from "react";

interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "flat" | "elevated" | "header" | "nav";
  className?: string;
}

export function GlassSurface({
  children,
  variant = "flat",
  className = "",
  ...props
}: GlassSurfaceProps) {
  const variantClasses = {
    flat: "glass-panel rounded-[22px]",
    elevated: "glass-panel-elevated rounded-[24px]",
    header: "glass-header",
    nav: "glass-nav",
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
