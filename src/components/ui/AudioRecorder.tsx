import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";

interface AudioRecorderProps {
  onUploadSuccess: (url: string) => void;
  bucket?: string;
}

export function AudioRecorder({ onUploadSuccess, bucket = 'voice_notes' }: AudioRecorderProps) {
  const { session } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerInterval.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error('Could not access microphone');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const uploadRecording = async () => {
    if (!audioBlob || !session?.user) return;
    setIsUploading(true);

    try {
      const fileName = `${session.user.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (error) throw error;

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      onUploadSuccess(publicData.publicUrl);
      clearRecording();
      toast.success('Audio uploaded successfully');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border">
        <div className="flex-1 px-2 text-sm font-medium">{formatTime(recordingTime)} recorded</div>
        <button onClick={clearRecording} disabled={isUploading} className="p-2 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-5 h-5" />
        </button>
        <button 
          onClick={uploadRecording} 
          disabled={isUploading} 
          className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <div className="flex items-center gap-4 bg-red-500/10 p-2 pl-4 pr-2 rounded-full border border-red-500/20">
          <div className="flex items-center gap-2 text-red-500 font-medium w-16">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {formatTime(recordingTime)}
          </div>
          <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
            <Square className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button 
          onClick={startRecording}
          className="p-3 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors"
        >
          <Mic className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
