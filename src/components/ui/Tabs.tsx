import { useState } from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pill";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
}: TabsProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === "pill") {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-white" : "text-[var(--color-text-muted)] hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="pill-active"
                  className="absolute inset-0 bg-[var(--color-surface-3)] rounded-full border border-[var(--color-border)]"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-1 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
              isActive ? "text-white" : "text-[var(--color-text-muted)] hover:text-white"
            } mx-2`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="underline-active"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
