import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Image, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";

// This page is largely redundant now that Home.tsx is the main feed,
// but we'll keep it updated for UI consistency.
export function Notes() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Notes</h1>
      </div>

      <div className="flex-1 px-5 space-y-6 pt-4">
        {/* Composer */}
        <Card variant="solid" className="p-4">
          <div className="flex gap-3 mb-3">
            <Avatar
              size={40}
              profile={{
                id: "me",
                display_name: "Me",
                avatar_url: "https://i.pravatar.cc/150?u=me",
              }}
            />
            <textarea
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent border-none text-white text-sm resize-none focus:outline-none placeholder:text-[var(--color-text-muted)]"
              rows={2}
            />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
            <div className="flex gap-2 text-[var(--color-text-muted)]">
              <button className="p-2 rounded-full hover:bg-[var(--color-surface-3)] transition">
                <Image size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-[var(--color-surface-3)] transition">
                <Mic size={18} />
              </button>
            </div>
            <Button variant="primary" size="sm" className="font-bold px-5">
              Post
            </Button>
          </div>
        </Card>

        {/* Empty State */}
        <div className="mt-8">
          <PremiumEmptyState
            icon={Edit3}
            title="It's quiet here"
            description="Be the first to share a note."
            glowColor="secondary"
          />
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-[88px] right-5 w-14 h-14 bg-gradient-to-br from-[#FF416C] to-[#8E2DE2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform z-40">
        <Plus size={24} />
      </button>
    </div>
  );
}

export default Notes;
