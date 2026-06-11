import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

interface AudioRecorderProps {
  onUploadSuccess: (url: string) => void;
  bucket?: string;
}

export function AudioRecorder({ onUploadSuccess, bucket = 'voice_notes' }: AudioRecorderProps) {
  const { session } = useAuthStore();
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
      mediaRecorder.cur
<truncated 2837 bytes>