import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1814] border border-[#2E2822]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#F5F0EA]">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-[#8A7F74] max-w-[240px]">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
