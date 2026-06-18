import { useMemo } from "react";

export interface VoiceWaveformProps {
  waveform?: number[];
  progress?: number; // 0 to 100
  activeColor?: string;
  inactiveColor?: string;
  height?: number; // max height in px
}

export function VoiceWaveform({
  waveform = [],
  progress = 0,
  activeColor = "var(--color-primary)",
  inactiveColor = "rgba(139, 92, 246, 0.2)", // dim purple
  height = 24,
}: VoiceWaveformProps) {
  // Provide a dummy waveform if none provided
  const normalizedWaveform = useMemo(() => {
    if (waveform && waveform.length > 0) return waveform;
    // Generate a beautiful, realistic-looking dummy waveform
    return Array.from({ length: 40 }, () => Math.floor(Math.random() * 60) + 15);
  }, [waveform]);

  return (
    <div className="flex items-center gap-0.5 w-full" style={{ height: `${height}px` }}>
      {normalizedWaveform.map((val, index) => {
        const isPlayed = (index / normalizedWaveform.length) * 100 <= progress;
        return (
          <div
            key={index}
            className="w-1 flex-1 rounded-full overflow-hidden transition-all duration-300"
            style={{
              height: `${Math.max(15, val)}%`,
              backgroundColor: isPlayed ? activeColor : inactiveColor,
            }}
          />
        );
      })}
    </div>
  );
}
