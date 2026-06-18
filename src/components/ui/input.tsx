import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", containerClassName = "", icon, error, ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        <div className="relative flex items-center w-full">
          {icon && <div className="absolute left-4 text-[var(--color-text-muted)]">{icon}</div>}
          <input
            ref={ref}
            className={`w-full h-14 rounded-[16px] bg-[var(--color-surface-2)] text-white placeholder-[var(--color-text-muted)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors ${
              icon ? "pl-12" : "pl-5"
            } pr-5 ${error ? "border-[var(--color-error)]" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-[var(--color-error)] text-xs pl-2">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
