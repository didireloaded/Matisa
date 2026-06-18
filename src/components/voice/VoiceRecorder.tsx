import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

interface VoiceRecorderProps {
  maxDurationSeconds?: number;
  onRecordingComplete?: (audioBlob: Blob, duration: number, waveform: number[]) => void;
  onPublish?: (audioUrl: string, duration: number, waveform: number[]) => Promise<void>;
  mode?: "note" | "story" | "intro" | "chat";
}

export function VoiceRecorder({
  maxDurationSeconds = 60,
  onRecordingComplete,
  onPublish,
  mode = "note",
}: VoiceRecorderProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(Array(30).fill(10));
  const [isPublishing, setIsPublishing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const updateWaveform = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Compress to 30 bars
    const bars = 30;
    const step = Math.floor(dataArray.length / bars);
    const newWaveform = [];
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      newWaveform.push(Math.max(10, sum / step)); // min height 10
    }
    setWaveform(newWaveform);

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.revokeObjectURL(audioUrl || "");
        setAudioUrl(URL.createObjectURL(blob));
        if (onRecordingComplete) onRecordingComplete(blob, recordingTime, waveform);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      updateWaveform();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDurationSeconds - 1) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Microphone access is required to record voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePublish = async () => {
    if (!audioBlob || !user || !onPublish) return;
    setIsPublishing(true);
    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const bucket = mode === "intro" ? "voice_notes" : "voice_notes"; // Can customize bucket

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, audioBlob);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      await onPublish(publicUrl, recordingTime, waveform);

      // Reset
      deleteRecording();
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish voice recording.");
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setWaveform(Array(30).fill(10));
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center bg-white/5 p-4 rounded-3xl border border-white/10 w-full max-w-sm">
      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-16 w-full px-4 mb-4">
        {waveform.map((height, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-[var(--primary)] rounded-full"
            animate={{ height: `${Math.min(100, height / 2.5)}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
          />
        ))}
      </div>

      <div className="text-white/60 text-sm font-medium mb-4">
        {formatTime(recordingTime)} / {formatTime(maxDurationSeconds)}
      </div>

      <div className="flex items-center justify-center gap-4 w-full">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,157,46,0.3)] hover:scale-105 transition-transform"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 transition-transform animate-pulse"
          >
            <Square className="w-6 h-6" fill="currentColor" />
          </button>
        )}

        {audioBlob && (
          <>
            <button
              onClick={deleteRecording}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayback}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 pl-1" fill="currentColor" />
              )}
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                isPublishing ? "bg-[var(--primary)]/50" : "bg-[var(--primary)] hover:bg-[#E8A055]"
              }`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
