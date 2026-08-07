// src/components/ui/VoicePlayer.tsx
import { Play, Pause } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";
import { useRecordedVoicePlayback } from "@/features/recorded-voice";

export interface VoicePlayerProps {
  audioUrl?: string;
  duration?: string; // e.g., "0:18"
  waveform?: number[];
  autoPlay?: boolean;
}

export function VoicePlayer({ audioUrl = "#", duration = "0:15", waveform }: VoicePlayerProps) {
  const playback = useRecordedVoicePlayback();
  const playbackId = `voice-player-${audioUrl}`;
  const isPlayingThis = playback.activeId === playbackId && playback.isPlaying;
  const progress = isPlayingThis ? (playback.currentTime / (playback.duration || 15)) * 100 : 0;

  // Parse duration string e.g. "0:18" -> 18s
  const parts = (duration || "0:15").split(":");
  const secs = parts.length === 2 ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) : 15;
  const initialDuration = secs > 0 ? secs : 15;

  const togglePlayback = () => {
    if (isPlayingThis) {
      playback.pause();
    } else {
      playback.play(playbackId, audioUrl, initialDuration);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full my-3">
      <button
        onClick={togglePlayback}
        className="w-10 h-10 shrink-0 rounded-full bg-[#24A3C7] flex items-center justify-center text-white shadow-[0_0_12px_rgba(36,163,199,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        {isPlayingThis ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        <VoiceWaveform waveform={waveform} progress={progress} height={28} />
      </div>

      <span className="text-white/60 text-sm font-medium w-9 text-right shrink-0 font-mono">
        {duration}
      </span>
    </div>
  );
}

export default VoicePlayer;
