import { Play, Pause, Mic } from "lucide-react";
import { useRecordedVoicePlayback } from "@/features/recorded-voice";

interface ProfileVoiceIntroProps {
  audioUrl?: string;
  durationSeconds?: number;
  waveform?: number[];
  isOwner?: boolean;
  onRecordNew?: () => void;
}

export function ProfileVoiceIntro({
  audioUrl,
  durationSeconds = 15,
  waveform = Array(20).fill(40),
  isOwner = false,
  onRecordNew,
}: ProfileVoiceIntroProps) {
  const playback = useRecordedVoicePlayback();
  const playbackId = `profile-intro-${audioUrl}`;
  const isPlayingThis = playback.activeId === playbackId && playback.isPlaying;
  const progress = isPlayingThis
    ? (playback.currentTime / (playback.duration || durationSeconds || 1)) * 100
    : 0;

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (isPlayingThis) {
      playback.pause();
    } else {
      playback.play(playbackId, audioUrl, durationSeconds);
    }
  };

  if (!audioUrl) {
    if (isOwner) {
      return (
        <button
          onClick={onRecordNew}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-dashed border-white/20 text-white/60 text-sm transition-colors"
        >
          <Mic className="w-4 h-4" />
          <span>Add Voice Intro</span>
        </button>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-full pl-2 pr-4 py-1.5 border border-white/10 w-fit">
      <button
        onClick={togglePlayback}
        className="w-8 h-8 rounded-full bg-[#24A3C7] flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md"
      >
        {isPlayingThis ? (
          <Pause className="w-4 h-4" fill="currentColor" />
        ) : (
          <Play className="w-4 h-4 pl-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex items-center gap-0.5 h-4 w-24">
        {waveform.slice(0, 20).map((height, i) => {
          const isPlayed = (i / 20) * 100 <= progress;
          return (
            <div
              key={i}
              className="w-1 flex-1 rounded-full overflow-hidden transition-all duration-300"
              style={{
                height: isPlayingThis ? `${Math.max(20, height)}%` : "30%",
                backgroundColor: isPlayed ? "#24A3C7" : "rgba(255,255,255,0.2)",
              }}
            />
          );
        })}
      </div>

      <span className="text-xs font-bold text-white/70">{durationSeconds}s</span>
    </div>
  );
}
