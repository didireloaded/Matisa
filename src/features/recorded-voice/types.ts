// src/features/recorded-voice/types.ts
import { VoiceMode } from "./config";

export interface RecordedVoice {
  blob: Blob;
  mimeType: string;
  extension: string;
  durationSeconds: number;
  waveform: number[];
  fileSizeBytes: number;
}

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "preview"
  | "uploading"
  | "error";

export interface RecorderState {
  status: RecorderStatus;
  mode: VoiceMode;
  elapsedSeconds: number;
  maxSeconds: number;
  liveAmplitudes: number[];
  recording: RecordedVoice | null;
  error?: Error;
  errorMessage?: string;
  permissionDenied?: boolean;
}

export interface VoiceUploadMetadata {
  userId: string;
  mode: VoiceMode;
  recipientId?: string;
  conversationId?: string;
  targetId?: string; // note_id or story_id for replies
}

export interface StorageUploadResult {
  path: string;
  isPrivate: boolean;
  publicUrl?: string;
}
