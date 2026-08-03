import type { ReactNode } from "react";
import { AlignLeft, CalendarDays, Mic, Send, Video } from "lucide-react";

type HomeConversationComposerProps = {
  avatar: ReactNode;
  onCreateNote: () => void;
  onOpenEvents: () => void;
};

type ComposerActionProps = {
  label: string;
  ariaLabel: string;
  icon: typeof AlignLeft;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
};

function ComposerAction({
  label,
  ariaLabel,
  icon: Icon,
  color,
  onClick,
  disabled = false,
}: ComposerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={disabled ? `${label} is not available yet` : undefined}
      className="flex min-w-0 flex-1 flex-col items-center gap-2 rounded-2xl py-1.5 text-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20">
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </span>
      <span className="text-[11px] font-medium text-white/48">{label}</span>
    </button>
  );
}

export function HomeConversationComposer({
  avatar,
  onCreateNote,
  onOpenEvents,
}: HomeConversationComposerProps) {
  return (
    <section
      aria-label="Start a conversation"
      className="mx-4 my-3 rounded-[24px] border border-white/10 bg-[#151515] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {avatar}
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          aria-label="Create a note"
          className="min-w-0 flex-1 py-2 text-left text-[15px] text-white/38 transition hover:text-white/55"
        >
          What's on your mind?
        </button>
        <button
          type="button"
          onClick={onCreateNote}
          aria-label="Send a note"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 active:scale-95"
        >
          <Send size={18} className="ml-0.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-start justify-between gap-1">
          <ComposerAction
            label="Note"
            ariaLabel="Create note"
            icon={AlignLeft}
            color="rgba(255,255,255,0.55)"
            onClick={onCreateNote}
          />
          <ComposerAction
            label="Voice Note"
            ariaLabel="Voice Note unavailable"
            icon={Mic}
            color="#A855F7"
            disabled
          />
          <ComposerAction
            label="Story"
            ariaLabel="Story unavailable"
            icon={Video}
            color="#EC4899"
            disabled
          />
          <ComposerAction
            label="Event"
            ariaLabel="Open events"
            icon={CalendarDays}
            color="#00D9E8"
            onClick={onOpenEvents}
          />
        </div>
      </div>
    </section>
  );
}

type TrendingConversationEmptyStateProps = {
  onCreateNote: () => void;
};

export function TrendingConversationEmptyState({
  onCreateNote,
}: TrendingConversationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 pb-16 pt-10 text-center">
      <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[#FF9D2E]/15 bg-[#FF9D2E]/[0.04] text-white shadow-[0_0_48px_rgba(255,157,46,0.14)]">
        <AlignLeft size={32} strokeWidth={2.2} />
      </div>
      <h2 className="text-xl font-bold text-white">No Conversations Yet</h2>
      <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-white/58">
        Start a conversation. Ask a question or share an idea.
      </p>
      <button
        type="button"
        onClick={onCreateNote}
        className="mt-8 rounded-full bg-[#FF9D2E] px-7 py-3.5 text-sm font-bold text-black shadow-[0_8px_24px_rgba(255,157,46,0.32)] transition hover:bg-[#FFAD4A] active:scale-95"
      >
        Ask a Question
      </button>
    </div>
  );
}
