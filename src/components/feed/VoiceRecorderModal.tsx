import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Mic, Square, Loader2, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface VoiceRecorderModalProps {
  children: React.ReactNode;
  onPostCreated?: () => void;
}

export function VoiceRecorderModal({ children, onPostCreated }: VoiceRecorderModalProps) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const { profile: user } = useAuth();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      stopRecording();
      setAudioUrl(null);
      setDuration(0);
    }
  }, [open]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone", err);
      toast.error("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioUrl || !user) return;
    
    setIsSubmitting(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const fileName = `${user.id}-${Date.now()}.webm`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice_notes')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('voice_notes')
        .getPublicUrl(fileName);

      // Create Post
      const { error: postError } = await supabase.from('posts').insert([
        {
          author_id: user.id,
          user_id: user.id, // For compatibility
          content: 'Sent a voice note',
          voice_url: publicUrlData.publicUrl,
          media_urls: [publicUrlData.publicUrl], // fallback
          is_story: false
        }
      ]);

      if (postError) throw postError;
      
      toast.success("Voice note posted!");
      setOpen(false);
      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to post voice note.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display text-center">Record Voice Note</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-8 py-8">
          
          <div className="text-4xl font-mono text-primary tracking-wider font-bold">
            {formatTime(duration)}
          </div>

          {!audioUrl ? (
            <div className="relative">
               {isRecording && (
                 <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
               )}
               <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground hover:scale-105'}`}
               >
                 {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
               </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-6">
              <audio src={audioUrl} controls className="w-full h-10 rounded-full bg-secondary" />
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => { setAudioUrl(null); setDuration(0); }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Post Voice
                </button>
              </div>
            </div>
          )}

          {!audioUrl && (
            <p className="text-muted-foreground text-sm font-medium">
              {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </p>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
