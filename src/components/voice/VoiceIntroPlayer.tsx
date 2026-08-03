import { useState, useRef } from "react";
import { Mic, Play, Pause, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";

interface VoiceIntroPlayerProps {
  audioUrl?: string | null;
  isOwner: boolean;
  profileId: string;
  onUpdated?: (url: string | null) => void;
}

/**
 * Compact Voice Introduction component for Profile pages.
 * Owners can record/replace/remove their intro.
 * Visitors see a play button to listen.
 */
export function VoiceIntroPlayer({
  audioUrl,
  isOwner,
  profileId,
  onUpdated,
}: VoiceIntroPlayerProps) {
  const { session } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const [recBlob, setRecBlob] = useState<Blob | null>(null);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const MAX_DURATION = 30; // 30 seconds max

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecBlob(blob);
        setRecUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      setRecElapsed(0);

      timerRef.current = window.setInterval(() => {
        setRecElapsed((p) => {
          if (p + 1 >= MAX_DURATION) {
            recorder.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return MAX_DURATION;
          }
          return p + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const discardRec = () => {
    if (recUrl) URL.revokeObjectURL(recUrl);
    setRecBlob(null);
    setRecUrl(null);
    setRecElapsed(0);
  };

  const saveIntro = async () => {
    if (!recBlob || !session?.user) return;
    setUploading(true);
    try {
      const fileName = `${session.user.id}/voice_intro_${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("voice_notes")
        .upload(fileName, recBlob, { contentType: "audio/webm" });
      if (error) throw error;

      const { data: pub } = supabase.storage.from("voice_notes").getPublicUrl(fileName);
      const url = pub.publicUrl;

      // Update profile
      await supabase.from("profiles").update({ voice_intro_url: url }).eq("id", profileId);

      onUpdated?.(url);
      discardRec();
      toast.success("Voice introduction saved!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeIntro = async () => {
    if (!session?.user) return;
    try {
      await supabase.from("profiles").update({ voice_intro_url: null }).eq("id", profileId);
      onUpdated?.(null);
      toast.success("Voice introduction removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // --- Recording preview state ---
  if (recBlob && recUrl) {
    return (
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-white/15">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24A3C7] text-white active:scale-90"
        >
          {isPlaying ? (
            <Pause size={14} fill="white" />
          ) : (
            <Play size={14} fill="white" className="ml-0.5" />
          )}
        </button>
        <span className="text-[10px] text-white/50 font-mono">{fmtTime(recElapsed)}</span>
        <button onClick={discardRec} className="text-red-400 hover:text-red-300 ml-auto">
          <Trash2 size={14} />
        </button>
        <button
          onClick={saveIntro}
          disabled={uploading}
          className="px-3 py-1 rounded-full bg-[#24A3C7] text-white text-[10px] font-bold active:scale-95"
        >
          {uploading ? "..." : "Save"}
        </button>
        <audio ref={audioRef} src={recUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
      </div>
    );
  }

  // --- Recording in progress ---
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 glass-panel p-2.5 rounded-[18px] border border-red-500/30">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-mono text-red-400">{fmtTime(recElapsed)}</span>
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-red-500 transition-all"
            style={{ width: `${(recElapsed / MAX_DURATION) * 100}%` }}
          />
        </div>
        <button
          onClick={stopRecording}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white active:scale-90"
        >
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
        </button>
      </div>
    );
  }

  // --- Has existing intro (visitor or owner) ---
  if (audioUrl) {
    return (
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-[#24A3C7]/30">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition"
        >
          {isPlaying ? (
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
          <button onClick={removeIntro} className="text-white/30 hover:text-red-400 ml-1">
            <X size={12} />
          </button>
        )}

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
          className="hidden"
        />
      </div>
    );
  }

  // --- No intro, owner can record ---
  if (isOwner) {
    return (
      <button
        onClick={startRecording}
        className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-[18px] border border-dashed border-[#24A3C7]/40 text-[#39B7F2] text-xs font-semibold hover:bg-[#24A3C7]/10 transition active:scale-95"
      >
        <Mic size={14} />
        <span>Add Voice Introduction</span>
      </button>
    );
  }

  // Visitor, no intro available
  return null;
}

export default VoiceIntroPlayer;
