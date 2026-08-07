// src/features/recorded-voice/useRecordedVoice.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { VoiceMode } from "./config";
import { RecordedVoiceEngine } from "./recorder";
import { RecorderState, VoiceUploadMetadata, StorageUploadResult } from "./types";
import { uploadRecordedVoice } from "./storage";

export function useRecordedVoice(mode: VoiceMode = "note") {
  const engineRef = useRef<RecordedVoiceEngine | null>(null);
  const [state, setState] = useState<RecorderState>({
    status: "idle",
    mode,
    elapsedSeconds: 0,
    maxSeconds: 300,
    liveAmplitudes: [],
    recording: null,
  });

  const handleStateChange = useCallback((newState: RecorderState) => {
    setState(newState);
  }, []);

  useEffect(() => {
    engineRef.current = new RecordedVoiceEngine(mode, handleStateChange);

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanupMedia();
      }
    };
  }, [mode, handleStateChange]);

  const startRecording = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.start();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cancel();
    }
  }, []);

  const uploadRecording = useCallback(
    async (metadata: VoiceUploadMetadata): Promise<StorageUploadResult | null> => {
      if (!state.recording) return null;

      setState((prev) => ({ ...prev, status: "uploading" }));

      try {
        const result = await uploadRecordedVoice(state.recording, metadata.mode, metadata.userId, {
          conversationId: metadata.conversationId,
          recipientId: metadata.recipientId,
        });

        setState((prev) => ({ ...prev, status: "preview" }));
        return result;
      } catch (err: any) {
        console.error("Upload error in useRecordedVoice:", err);
        setState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "Upload failed — check network connection and try again.",
        }));
        return null;
      }
    },
    [state.recording],
  );

  return {
    state,
    startRecording,
    stopRecording,
    cancelRecording,
    uploadRecording,
  };
}
