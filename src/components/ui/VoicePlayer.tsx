import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";

export interface VoicePlayerProps {
  id: string;
  audioUrl?: string;
  duration?: string; // e.g., "0:18"
  durationSeconds?: number;
  waveform?: number[];
  autoPlay?: boolean;
}

export function VoicePlayer({
  id,
  audioUrl,
  duration,
  durationSeconds,
  waveform,
  autoPlay = false,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Single active enforcement
  useEffect(() => {
    const handleGlobalPlay = (e: CustomEvent<{ id: string }>) => {
      if (e.detail.id !== id && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("voicePlayerPlay" as any, handleGlobalPlay);
    return () => {
      window.removeEventListener("voicePlayerPlay" as any, handleGlobalPlay);
    };
  }, [id, isPlaying]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      window.dispatchEvent(new CustomEvent("voicePlayerPlay", { detail: { id } }));
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [autoPlay, id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        window.dispatchEvent(new CustomEvent("voicePlayerPlay", { detail: { id } }));
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || durationSeconds || 1;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const total = audioRef.current.duration || durationSeconds || 1;
    audioRef.current.currentTime = percentage * total;
    setProgress(percentage * 100);
  };

  const toggleSpeed = () => {
    setSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  // Format duration if not provided as string
  const displayDuration =
    duration ||
    (durationSeconds
      ? `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60).toString().padStart(2, "0")}`
      : "0:00");

  return (
    <div className="flex items-center gap-3 w-full my-2 bg-[var(--color-surface)] p-2 pr-4 rounded-full border border-white/5">
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

      <div className="flex-1 cursor-pointer py-2" onClick={handleSeek}>
        <VoiceWaveform waveform={waveform || Array(30).fill(20)} progress={progress} height={28} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleSpeed}
          className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded"
        >
          {speed}x
        </button>
        <span className="text-[var(--color-text-muted)] text-xs font-medium w-9 text-right tabular-nums">
          {displayDuration}
        </span>
      </div>

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
