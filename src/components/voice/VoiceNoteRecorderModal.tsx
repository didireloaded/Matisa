import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Send,
  X,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";

interface VoiceNoteRecorderModalProps {
  open: boolean;
  onClose: () => void;
  onPublished?: (url: string) => void;
  mode?: "note" | "reply" | "message" | "voicemail" | "story";
  /** Max recording seconds. Default 120 (2 min). */
  maxDuration?: number;
}

type RecorderState = "idle" | "recording" | "preview" | "uploading";

export function VoiceNoteRecorderModal({
  open,
  onClose,
  onPublished,
  mode = "note",
  maxDuration = 120,
}: VoiceNoteRecorderModalProps) {
  const { session } = useAuth();

  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [noteLifetime, setNoteLifetime] = useState<"temporary" | "permanent">("temporary");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [liveAmplitudes, setLiveAmplitudes] = useState<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, []);

  // Auto-stop at max duration
  useEffect(() => {
    if (state === "recording" && elapsed >= maxDuration) {
      stopRecording();
    }
  }, [elapsed, maxDuration, state]);

  const stopAllMedia = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  };

  const startRecording = async () => {
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for live waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setState("preview");
      };

      recorder.start();
      setState("recording");
      setElapsed(0);
      setLiveAmplitudes([]);

      timerRef.current = window.setInterval(() => {
        setElapsed((p) => p + 1);

        // Sample live amplitude for waveform visualization
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          const normalized = Math.min(100, Math.max(10, (avg / 128) * 100));
          setLiveAmplitudes((prev) => [...prev.slice(-59), normalized]);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Mic access denied:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
      } else {
        toast.error("Could not access microphone");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setPlayProgress(0);
    setIsPlaying(false);
    setLiveAmplitudes([]);
    setState("idle");
  };

  const togglePreviewPlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const publishVoiceNote = async () => {
    if (!audioBlob || !session?.user) {
      toast.error("No recording to publish");
      return;
    }

    setState("uploading");
    try {
      const fileName = `${session.user.id}/${Date.now()}.webm`;
      const bucket = mode === "voicemail" ? "voicemail" : "voice_notes";

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, audioBlob, { contentType: "audio/webm" });

      if (uploadErr) throw uploadErr;

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = publicData.publicUrl;

      onPublished?.(publicUrl);

      toast.success(
        mode === "reply"
          ? "Voice reply sent!"
          : mode === "voicemail"
            ? "Voicemail sent!"
            : mode === "message"
              ? "Voice message sent!"
              : noteLifetime === "temporary"
                ? "Voice Note published! Disappears in 24h."
                : "Voice Note published!",
      );

      // Reset state
      discardRecording();
      onClose();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error("Upload failed — tap to retry");
      setState("preview");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-[430px] rounded-t-[32px] glass-panel-elevated p-6 border-t border-white/20 shadow-2xl backdrop-blur-2xl bg-[#06101D]/95 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white tracking-wide">
              {mode === "reply" && "Voice Reply"}
              {mode === "voicemail" && "Leave Voicemail"}
              {mode === "message" && "Voice Message"}
              {mode === "story" && "Voice Story"}
              {mode === "note" && "Voice Note"}
            </h2>
            <button
              onClick={() => {
                discardRecording();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full glass-panel text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Permission Denied State */}
          {permissionDenied && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertCircle size={28} />
              </div>
              <p className="text-sm font-semibold text-white">Microphone Access Denied</p>
              <p className="text-xs text-white/50 max-w-[280px]">
                Please allow microphone access in your browser settings to record voice.
              </p>
              <button
                onClick={() => {
                  setPermissionDenied(false);
                  startRecording();
                }}
                className="mt-2 px-5 py-2 rounded-full bg-[#24A3C7] text-white font-bold text-xs active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Idle State — Big Mic Button */}
          {state === "idle" && !permissionDenied && (
            <div className="flex flex-col items-center gap-5 py-6">
              <button
                onClick={startRecording}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9D2E] to-[#24A3C7] text-white shadow-[0_0_30px_rgba(36,163,199,0.4)] active:scale-90 transition hover:shadow-[0_0_40px_rgba(36,163,199,0.6)]"
                aria-label="Start Recording"
              >
                <Mic size={32} />
              </button>
              <p className="text-xs text-white/50">Tap to start recording</p>

              {mode === "note" && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setNoteLifetime("temporary")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                      noteLifetime === "temporary"
                        ? "bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <Clock size={12} />
                    24h Temporary
                  </button>
                  <button
                    onClick={() => setNoteLifetime("permanent")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                      noteLifetime === "permanent"
                        ? "bg-[#39B7F2]/20 text-[#39B7F2] border border-[#39B7F2]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <FileText size={12} />
                    Permanent
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recording State — Live Waveform & Timer */}
          {state === "recording" && (
            <div className="flex flex-col items-center gap-5 py-4">
              {/* Live pulsing indicator */}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                <span className="text-sm font-bold text-red-400">Recording</span>
                <span className="text-sm font-mono text-white/80 ml-1">
                  {formatTime(elapsed)} / {formatTime(maxDuration)}
                </span>
              </div>

              {/* Live waveform visualization */}
              <div className="w-full h-16 flex items-center justify-center gap-0.5 px-4">
                {liveAmplitudes.map((amp, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-[#FF9D2E] to-[#24A3C7]"
                    animate={{ height: `${Math.max(8, amp * 0.6)}px` }}
                    transition={{ duration: 0.15 }}
                  />
                ))}
                {/* Fill remaining bars with static placeholders */}
                {Array.from({ length: Math.max(0, 60 - liveAmplitudes.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-1 h-2 rounded-full bg-white/10" />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF9D2E] to-red-500 transition-all"
                  style={{ width: `${(elapsed / maxDuration) * 100}%` }}
                />
              </div>

              {/* Stop button */}
              <button
                onClick={stopRecording}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-90 transition"
                aria-label="Stop Recording"
              >
                <Square size={22} fill="white" />
              </button>
            </div>
          )}

          {/* Preview State — Playback, Caption, Publish */}
          {state === "preview" && audioUrl && (
            <div className="space-y-4">
              {/* Playback controls */}
              <div className="flex items-center gap-3 glass-panel p-3 rounded-[22px]">
                <button
                  onClick={togglePreviewPlay}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="white" />
                  ) : (
                    <Play size={18} fill="white" className="ml-0.5" />
                  )}
                </button>

                <div className="flex-1">
                  <VoiceWaveform
                    waveform={liveAmplitudes.length > 5 ? liveAmplitudes : undefined}
                    progress={playProgress}
                    height={32}
                    activeColor="#24A3C7"
                    inactiveColor="rgba(36, 163, 199, 0.2)"
                  />
                </div>

                <span className="text-xs font-mono text-white/60 w-10 text-right">
                  {formatTime(elapsed)}
                </span>
              </div>

              {/* Hidden audio element for playback */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    const pct =
                      (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
                    setPlayProgress(pct);
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setPlayProgress(0);
                }}
                className="hidden"
              />

              {/* Optional caption */}
              {(mode === "note" || mode === "reply") && (
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add an optional caption..."
                  className="w-full px-4 py-3 rounded-full glass-panel text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#24A3C7]"
                />
              )}

              {/* Lifetime selector for notes */}
              {mode === "note" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNoteLifetime("temporary")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition ${
                      noteLifetime === "temporary"
                        ? "bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <Clock size={11} /> Disappears in 24h
                  </button>
                  <button
                    onClick={() => setNoteLifetime("permanent")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition ${
                      noteLifetime === "permanent"
                        ? "bg-[#39B7F2]/20 text-[#39B7F2] border border-[#39B7F2]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <FileText size={11} /> Stays on profile
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={discardRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel text-red-400 text-xs font-bold border border-red-500/30 hover:bg-red-500/10 transition active:scale-95"
                >
                  <Trash2 size={14} />
                  <span>Discard</span>
                </button>

                <button
                  onClick={startRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel text-white/70 text-xs font-bold hover:bg-white/10 transition active:scale-95"
                >
                  <Mic size={14} />
                  <span>Re-record</span>
                </button>

                <button
                  onClick={publishVoiceNote}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white text-xs font-bold shadow-lg active:scale-95 transition"
                >
                  <Send size={14} />
                  <span>
                    {mode === "reply"
                      ? "Send Reply"
                      : mode === "voicemail"
                        ? "Send Voicemail"
                        : "Publish"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {state === "uploading" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="h-10 w-10 rounded-full border-2 border-[#24A3C7] border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-white/80">Uploading voice...</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default VoiceNoteRecorderModal;
