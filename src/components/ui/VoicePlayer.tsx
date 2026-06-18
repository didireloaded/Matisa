import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";

export interface VoicePlayerProps {
  audioUrl?: string;
  duration?: string; // e.g., "0:18"
  waveform?: number[];
  autoPlay?: boolean;
}

export function VoicePlayer({
  audioUrl,
  duration = "0:00",
  waveform,
  autoPlay = false,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [autoPlay]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="flex items-center gap-3 w-full my-3">
      <button
        onClick={togglePlayback}
        className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        {isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-1" />
        )}
      </button>

      <div className="flex-1">
        <VoiceWaveform waveform={waveform} progress={progress} height={28} />
      </div>

      <span className="text-[var(--color-text-muted)] text-sm font-medium w-9 text-right shrink-0">
        {duration}
      </span>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="hidden"
        />
      )}
    </div>
  );
}
