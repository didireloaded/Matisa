import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-full border border-border w-48">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow hover:bg-primary/90 transition-colors"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-100 ease-linear" 
          style={{ width: `${progress || 0}%` }}
        />
      </div>
    </div>
  );
}
