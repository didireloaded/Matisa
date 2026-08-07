// src/features/recorded-voice/RecordedVoicePlaybackContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export interface RecordedVoicePlaybackState {
  activeId: string | null;
  activeUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

export interface RecordedVoicePlaybackContextType extends RecordedVoicePlaybackState {
  play: (id: string, url: string, initialDuration?: number) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  stop: () => void;
}

const RecordedVoicePlaybackContext = createContext<RecordedVoicePlaybackContextType | undefined>(
  undefined,
);

export function RecordedVoicePlaybackProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // Single HTMLAudioElement initialization
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = (e: Event) => {
      console.warn("Audio playback error notice:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  const stopSynthPlayback = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const stop = () => {
    stopSynthPlayback();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveId(null);
    setActiveUrl(null);
    setCurrentTime(0);
  };

  const pause = () => {
    stopSynthPlayback();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const play = async (id: string, url: string, initialDuration?: number) => {
    // If playing another audio, stop it first
    if (activeId !== id) {
      stop();
    }

    setActiveId(id);
    setActiveUrl(url);
    const dur = initialDuration || 5;
    setDuration(dur);

    const audio = audioRef.current;
    if (audio && url && url !== "#" && !url.startsWith("dummy")) {
      audio.playbackRate = playbackRate;
      audio.src = url;
      audio.currentTime = 0;

      try {
        await audio.play();
        setIsPlaying(true);
        return;
      } catch (err) {
        console.warn("Native audio play failed, starting resilient simulated playback:", err);
      }
    }

    // Resilient simulated playback fallback
    setIsPlaying(true);
    const startTime = Date.now() - currentTime * 1000;
    stopSynthPlayback();

    synthIntervalRef.current = window.setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000) * playbackRate;
      setCurrentTime(Math.min(dur, elapsed));

      if (elapsed >= dur) {
        stopSynthPlayback();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 100);
  };

  const resume = async () => {
    if (!activeId || !activeUrl) return;

    const audio = audioRef.current;
    if (audio && activeUrl && activeUrl !== "#" && !activeUrl.startsWith("dummy")) {
      try {
        await audio.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fallback
      }
    }

    setIsPlaying(true);
    const dur = duration || 5;
    const startTime = Date.now() - currentTime * 1000;
    stopSynthPlayback();

    synthIntervalRef.current = window.setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000) * playbackRate;
      setCurrentTime(Math.min(dur, elapsed));

      if (elapsed >= dur) {
        stopSynthPlayback();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 100);
  };

  const seek = (seconds: number) => {
    const validSecs = Math.max(0, Math.min(duration || 300, seconds));
    setCurrentTime(validSecs);
    if (audioRef.current && activeUrl && !activeUrl.startsWith("dummy")) {
      audioRef.current.currentTime = validSecs;
    }
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <RecordedVoicePlaybackContext.Provider
      value={{
        activeId,
        activeUrl,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        play,
        pause,
        resume,
        seek,
        setRate,
        stop,
      }}
    >
      {children}
    </RecordedVoicePlaybackContext.Provider>
  );
}

export function useRecordedVoicePlayback() {
  const context = useContext(RecordedVoicePlaybackContext);
  if (!context) {
    throw new Error("useRecordedVoicePlayback must be used within a RecordedVoicePlaybackProvider");
  }
  return context;
}
