// src/components/voice/VoiceWaveform.tsx
// Interactive waveform visualization component for voice playback and recording

import React, { useRef } from "react";

export interface VoiceWaveformProps {
  peaks: number[]; // Array of normalized peak heights (0-1)
  progress?: number; // Playback progress (0-1)
  onSeek?: (progress: number) => void;
  isPlaying?: boolean;
  barColor?: string;
  playedColor?: string;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  peaks = [],
  progress = 0,
  onSeek,
  isPlaying = false,
  barColor = "rgba(255, 255, 255, 0.25)",
  playedColor = "#00D9C0",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback default waveform if no peaks provided
  const displayPeaks =
    peaks.length >= 20
      ? peaks
      : Array.from({ length: 40 }, (_, i) => 0.2 + Math.abs(Math.sin(i * 0.4)) * 0.6);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onSeek) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(newProgress);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`flex items-center gap-[2px] h-8 cursor-pointer select-none py-1 ${className}`}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {displayPeaks.map((peak, i) => {
        const isPlayed = i / displayPeaks.length < progress;
        const height = Math.max(4, peak * 28);

        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-100"
            style={{
              height: `${height}px`,
              backgroundColor: isPlayed ? playedColor : barColor,
              opacity: isPlaying ? (isPlayed ? 1 : 0.7) : 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

export default VoiceWaveform;
