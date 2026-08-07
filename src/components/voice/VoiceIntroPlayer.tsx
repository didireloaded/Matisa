// src/components/voice/VoiceIntroPlayer.tsx
import { useState } from "react";
import { Mic, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import { useRecordedVoicePlayback, deleteVoiceIntroAdapter } from "@/features/recorded-voice";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";

interface VoiceIntroPlayerProps {
  audioUrl?: string | null;
  isOwner: boolean;
  profileId: string;
  onUpdated?: (url: string | null) => void;
}

export function VoiceIntroPlayer({
  audioUrl,
  isOwner,
  profileId,
  onUpdated,
}: VoiceIntroPlayerProps) {
  const playback = useRecordedVoicePlayback();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const playbackId = `voice-intro-${profileId}`;
  const isPlayingThis = playback.activeId === playbackId && playback.isPlaying;
  const progress = isPlayingThis ? (playback.currentTime / (playback.duration || 15)) * 100 : 0;

  const togglePlay = () => {
    if (!audioUrl) return;
    if (isPlayingThis) {
      playback.pause();
    } else {
      playback.play(playbackId, audioUrl, 30);
    }
  };

  const removeIntro = async () => {
    try {
      await deleteVoiceIntroAdapter(profileId);
      onUpdated?.(null);
      toast.success("Voice introduction removed");
    } catch (err: any) {
      toast.error("Failed to remove intro: " + err.message);
    }
  };

  // --- Has existing intro (visitor or owner) ---
  if (audioUrl) {
    return (
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-[#24A3C7]/30">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition shrink-0"
        >
          {isPlayingThis ? (
            <Pause size={14} fill="white" />
          ) : (
            <Play size={14} fill="white" className="ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <VoiceWaveform
            progress={progress}
            height={20}
            activeColor="#24A3C7"
            inactiveColor="rgba(36,163,199,0.15)"
          />
        </div>

        <span className="text-[10px] text-[#39B7F2] font-bold">Voice intro</span>

        {isOwner && (
          <button
            onClick={removeIntro}
            className="p-1 text-white/40 hover:text-red-400 transition"
            title="Delete intro"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    );
  }

  // --- No intro, owner can record ---
  if (isOwner) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-[18px] border border-dashed border-[#24A3C7]/40 text-[#39B7F2] text-xs font-semibold hover:bg-[#24A3C7]/10 transition active:scale-95"
        >
          <Mic size={14} />
          <span>Add Voice Introduction</span>
        </button>

        {isModalOpen && (
          <VoiceNoteRecorderModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onPublished={(url) => {
              onUpdated?.(url);
              setIsModalOpen(false);
            }}
            mode="intro"
          />
        )}
      </>
    );
  }

  // Visitor, no intro available
  return null;
}

export default VoiceIntroPlayer;
