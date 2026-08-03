import { useState, useRef } from "react";
import { Mic, Play, Pause, Send, Trash2, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import { Avatar } from "@/components/common/Avatar";

interface VoiceReplyProps {
  noteId: string;
  onSent?: () => void;
}

/**
 * Inline voice reply recorder for Note threads (Pass the Mic).
 * Records a short voice reply (max 60s), previews, and publishes.
 */
export function VoiceReplyRecorder({ noteId, onSent }: VoiceReplyProps) {
  const { session, profile } = useAuth();

  const [phase, setPhase] = useState<"idle" | "recording" | "preview" | "uploading">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_SECS = 60;

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(b);
        setBlobUrl(URL.createObjectURL(b));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setPhase("preview");
      };

      mr.start();
      setPhase("recording");
      setElapsed(0);

      timerRef.current = window.setInterval(() => {
        setElapsed((p) => {
          if (p + 1 >= MAX_SECS) {
            mr.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return MAX_SECS;
          }
          return p + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const discard = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null);
    setBlobUrl(null);
    setElapsed(0);
    setProgress(0);
    setIsPlaying(false);
    setPhase("idle");
  };

  const togglePlay = () => {
    if (!audioRef.current || !blobUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const publish = async () => {
    if (!blob || !session?.user) return;
    setPhase("uploading");
    try {
      const fileName = `${session.user.id}/voice_reply_${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("voice_notes")
        .upload(fileName, blob, { contentType: "audio/webm" });
      if (error) throw error;

      const { data: pub } = supabase.storage.from("voice_notes").getPublicUrl(fileName);

      // Insert voice reply record
      await supabase.from("voice_replies").insert({
        note_id: noteId,
        author_id: session.user.id,
        audio_url: pub.publicUrl,
        duration_seconds: elapsed,
      });

      toast.success("Voice reply sent — Pass the Mic! 🎤");
      discard();
      onSent?.();
    } catch (err: any) {
      toast.error("Failed to send voice reply");
      setPhase("preview");
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // --- Idle: Show mic trigger ---
  if (phase === "idle") {
    return (
      <button
        onClick={startRec}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel border border-[#24A3C7]/30 text-[#39B7F2] text-xs font-bold hover:bg-[#24A3C7]/10 transition active:scale-95"
      >
        <Mic size={14} />
        <span>Voice Reply</span>
      </button>
    );
  }

  // --- Recording ---
  if (phase === "recording") {
    return (
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-red-500/30">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[11px] font-mono text-red-400">{fmtTime(elapsed)}</span>
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${(elapsed / MAX_SECS) * 100}%` }}
          />
        </div>
        <button
          onClick={stopRec}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white active:scale-90"
        >
          <Square size={10} fill="white" />
        </button>
      </div>
    );
  }

  // --- Preview ---
  if (phase === "preview" && blobUrl) {
    return (
      <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-[#24A3C7]/30">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24A3C7] text-white active:scale-90"
        >
          {isPlaying ? (
            <Pause size={13} fill="white" />
          ) : (
            <Play size={13} fill="white" className="ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <VoiceWaveform
            progress={progress}
            height={18}
            activeColor="#24A3C7"
            inactiveColor="rgba(36,163,199,0.15)"
          />
        </div>

        <span className="text-[10px] text-white/50 font-mono">{fmtTime(elapsed)}</span>

        <button onClick={discard} className="text-red-400 hover:text-red-300">
          <Trash2 size={13} />
        </button>

        <button
          onClick={publish}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white active:scale-90"
        >
          <Send size={12} className="ml-0.5" />
        </button>

        <audio
          ref={audioRef}
          src={blobUrl}
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

  // --- Uploading ---
  return (
    <div className="flex items-center gap-2 glass-panel p-2.5 rounded-[18px] border border-[#24A3C7]/30">
      <div className="h-5 w-5 rounded-full border-2 border-[#24A3C7] border-t-transparent animate-spin" />
      <span className="text-xs text-white/60">Sending voice reply...</span>
    </div>
  );
}

export default VoiceReplyRecorder;
