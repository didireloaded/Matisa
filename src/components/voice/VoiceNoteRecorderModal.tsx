// src/components/voice/VoiceNoteRecorderModal.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import {
  VoiceMode,
  VOICE_LIMITS,
  useRecordedVoice,
  useRecordedVoicePlayback,
  publishVoiceNoteAdapter,
  sendVoiceMessageAdapter,
  saveVoiceIntroAdapter,
  publishVoiceStoryAdapter,
  sendVoiceReplyAdapter,
} from "@/features/recorded-voice";
import { VoicemailService } from "@/features/voicemail/services/VoicemailService";

interface VoiceNoteRecorderModalProps {
  open: boolean;
  onClose: () => void;
  onPublished?: (urlOrPath: string) => void;
  mode?: VoiceMode;
  recipientId?: string;
  conversationId?: string;
  targetId?: string;
}

export function VoiceNoteRecorderModal({
  open,
  onClose,
  onPublished,
  mode = "note",
  recipientId,
  conversationId,
  targetId,
}: VoiceNoteRecorderModalProps) {
  const { session, profile } = useAuth();
  const { state, startRecording, stopRecording, cancelRecording } = useRecordedVoice(mode);
  const playback = useRecordedVoicePlayback();

  const [noteLifetime, setNoteLifetime] = useState<"temporary" | "permanent">("temporary");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Create temporary object URL for previewing the recording locally
  useEffect(() => {
    if (state.recording?.blob) {
      const url = URL.createObjectURL(state.recording.blob);
      setPreviewObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewObjectUrl(null);
    }
  }, [state.recording]);

  const activeUserId = session?.user?.id || profile?.id || "demo-user-123";
  const maxLimit = VOICE_LIMITS[mode];

  const handleClose = () => {
    playback.stop();
    cancelRecording();
    setCaption("");
    onClose();
  };

  const handlePublish = async () => {
    if (!state.recording) {
      toast.error("No recording available");
      return;
    }

    setIsSubmitting(true);
    try {
      let resultPathOrUrl = "";

      switch (mode) {
        case "note": {
          const noteRes = await publishVoiceNoteAdapter(
            state.recording,
            activeUserId,
            noteLifetime,
            caption,
          );
          resultPathOrUrl = (noteRes as any)?.audio_url || "";
          toast.success(
            noteLifetime === "temporary"
              ? "Voice Note published! Disappears in 24h."
              : "Voice Note published!",
          );
          break;
        }

        case "message": {
          if (!conversationId) {
            toast.error("Missing conversation details");
            setIsSubmitting(false);
            return;
          }
          const msgRes = await sendVoiceMessageAdapter(
            state.recording,
            conversationId,
            activeUserId,
          );
          resultPathOrUrl = msgRes?.media_path || "";
          toast.success("Voice message sent!");
          break;
        }

        case "voicemail": {
          if (!recipientId) {
            toast.error("Recipient required for voicemail");
            setIsSubmitting(false);
            return;
          }
          const vmRes = await VoicemailService.sendVoicemail({
            senderId: activeUserId,
            recipientId,
            recording: state.recording,
          });
          resultPathOrUrl = vmRes?.storage_path || "";
          toast.success("Voicemail sent!");
          break;
        }

        case "intro": {
          const introRes = await saveVoiceIntroAdapter(state.recording, activeUserId);
          resultPathOrUrl = introRes.publicUrl;
          toast.success("Voice Intro saved to profile!");
          break;
        }

        case "story": {
          const storyRes = await publishVoiceStoryAdapter(state.recording, activeUserId, caption);
          resultPathOrUrl = storyRes?.media_url || "";
          toast.success("Voice Story published!");
          break;
        }

        case "reply": {
          if (!recipientId) {
            toast.error("Recipient required for voice reply");
            setIsSubmitting(false);
            return;
          }
          const replyRes = await sendVoiceReplyAdapter(state.recording, activeUserId, recipientId, {
            noteId: targetId,
          });
          resultPathOrUrl = replyRes?.storage_path || "";
          toast.success("Private Voice Reply sent!");
          break;
        }
      }

      onPublished?.(resultPathOrUrl);
      handleClose();
    } catch (err: any) {
      console.error("Publish voice error:", err);
      // DO NOT destroy recording on failure - allow user to tap Retry
      toast.error("Upload failed — tap Publish to retry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!open) return null;

  const isPreviewingThis = playback.activeId === "modal-preview" && playback.isPlaying;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={handleClose} />

        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-[430px] max-h-[calc(100dvh-12px)] overflow-y-auto overscroll-contain rounded-t-[32px] glass-panel-elevated px-6 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))] border-t border-white/20 shadow-2xl backdrop-blur-2xl bg-[#06101D]/95 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {mode === "reply" && "Private Voice Reply"}
                {mode === "voicemail" && "Leave Voicemail"}
                {mode === "message" && "Voice Message"}
                {mode === "story" && "Voice Story"}
                {mode === "intro" && "Profile Voice Intro"}
                {mode === "note" && "Voice Note"}
              </h2>
              <p className="text-[11px] text-white/50">Max duration: {formatTime(maxLimit)}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full glass-panel text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Permission Denied / Error State */}
          {state.permissionDenied && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertCircle size={26} />
              </div>
              <p className="text-sm font-semibold text-white">Microphone Permission Denied</p>
              <p className="text-xs text-white/50 max-w-[280px]">
                {state.errorMessage || "Please allow microphone access in your browser settings."}
              </p>
              <button
                onClick={startRecording}
                className="mt-2 px-5 py-2 rounded-full bg-[#24A3C7] text-white font-bold text-xs active:scale-95 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* IDLE State */}
          {state.status === "idle" && !state.permissionDenied && (
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
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setNoteLifetime("temporary")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
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
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
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

          {/* RECORDING State */}
          {state.status === "recording" && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                <span className="text-sm font-bold text-red-400">Recording</span>
                <span className="text-sm font-mono text-white/80 ml-1">
                  {formatTime(state.elapsedSeconds)} / {formatTime(maxLimit)}
                </span>
              </div>

              {/* Live Waveform */}
              <div className="w-full h-16 flex items-center justify-center gap-0.5 px-4">
                {state.liveAmplitudes.map((amp, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-[#FF9D2E] to-[#24A3C7]"
                    animate={{ height: `${Math.max(8, amp * 0.6)}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
                {Array.from({ length: Math.max(0, 60 - state.liveAmplitudes.length) }).map(
                  (_, i) => (
                    <div key={`empty-${i}`} className="w-1 h-2 rounded-full bg-white/10" />
                  ),
                )}
              </div>

              {/* Stop Button */}
              <button
                onClick={stopRecording}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-90 transition"
                aria-label="Stop Recording"
              >
                <Square size={22} fill="white" />
              </button>
            </div>
          )}

          {/* PREVIEW State */}
          {state.status === "preview" && state.recording && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 glass-panel p-3 rounded-[22px]">
                <button
                  onClick={() => {
                    if (isPreviewingThis) {
                      playback.pause();
                    } else {
                      playback.play(
                        "modal-preview",
                        previewObjectUrl || "#",
                        state.recording!.durationSeconds,
                      );
                    }
                  }}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition"
                >
                  {isPreviewingThis ? (
                    <Pause size={18} fill="white" />
                  ) : (
                    <Play size={18} fill="white" className="ml-0.5" />
                  )}
                </button>

                <div className="flex-1">
                  <VoiceWaveform
                    waveform={state.recording.waveform}
                    progress={
                      isPreviewingThis ? (playback.currentTime / (playback.duration || 1)) * 100 : 0
                    }
                    height={32}
                    activeColor="#24A3C7"
                    inactiveColor="rgba(36, 163, 199, 0.2)"
                  />
                </div>

                <span className="text-xs font-mono text-white/60 w-10 text-right">
                  {formatTime(state.recording.durationSeconds)}
                </span>
              </div>

              {/* File size indicator */}
              <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
                <span>Format: {state.recording.extension.toUpperCase()}</span>
                <span>{(state.recording.fileSizeBytes / 1024).toFixed(1)} KB</span>
              </div>

              {/* Optional Caption */}
              {(mode === "note" || mode === "story" || mode === "reply") && (
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add an optional caption..."
                  className="w-full px-4 py-3 rounded-full glass-panel text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#24A3C7]"
                />
              )}

              {/* Lifetime selector for Notes */}
              {mode === "note" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNoteLifetime("temporary")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      noteLifetime === "temporary"
                        ? "bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <Clock size={11} /> Disappears in 24h
                  </button>
                  <button
                    onClick={() => setNoteLifetime("permanent")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      noteLifetime === "permanent"
                        ? "bg-[#39B7F2]/20 text-[#39B7F2] border border-[#39B7F2]/40"
                        : "glass-panel text-white/50"
                    }`}
                  >
                    <FileText size={11} /> Stays on profile
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={cancelRecording}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel text-red-400 text-xs font-bold border border-red-500/30 hover:bg-red-500/10 transition active:scale-95 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span>Discard</span>
                </button>

                <button
                  onClick={startRecording}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-panel text-white/70 text-xs font-bold hover:bg-white/10 transition active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  <span>Retake</span>
                </button>

                <button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white text-xs font-bold shadow-lg active:scale-95 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>
                        {mode === "reply"
                          ? "Send Reply"
                          : mode === "voicemail"
                            ? "Send Voicemail"
                            : mode === "message"
                              ? "Send Message"
                              : mode === "intro"
                                ? "Save Intro"
                                : "Publish"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* UPLOADING State */}
          {isSubmitting && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-10 w-10 rounded-full border-2 border-[#24A3C7] border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-white/80">Uploading voice media...</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

export default VoiceNoteRecorderModal;
