import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Square, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceService } from "@/services/voice";
import { toast } from "sonner";

interface CreateVoicePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateVoicePostModal({ open, onClose }: CreateVoicePostModalProps) {
  const { profile } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      // Cleanup on close
      if (isRecording) stopRecording();
      setAudioBlob(null);
      setRecordingTime(0);
      setTitle("");
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Could not access microphone");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !audioBlob) return;
    setLoading(true);
    try {
      await VoiceService.createVoicePost(profile.id, audioBlob, recordingTime, title);
      toast.success("Voice post shared!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to post voice note");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full max-w-sm bg-[#1C1814] border border-[#2E2822] rounded-[32px] p-6 shadow-2xl flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-2">Voice Note</h2>
          <p className="text-sm text-[#8A7F74] mb-8 text-center">
            Record a short audio clip to share on your feed.
          </p>

          {/* Recording UI */}
          <div className="relative mb-8">
            {isRecording && (
              <div className="absolute inset-0 bg-[#C8521A] rounded-full animate-ping opacity-20" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!!audioBlob && !isRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : audioBlob
                    ? "bg-green-500"
                    : "bg-[#C8521A] hover:bg-[#E8A055]"
              } ${audioBlob && !isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <Square className="w-10 h-10 text-white fill-current" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          <div className="text-3xl font-mono text-white font-light mb-8">
            {formatTime(recordingTime)}
          </div>

          {audioBlob && !isRecording && (
            <div className="w-full space-y-4">
              <input
                type="text"
                placeholder="Add a title (optional)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C8521A]"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                    setTitle("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-[#C8521A] hover:bg-[#E8A055] transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
