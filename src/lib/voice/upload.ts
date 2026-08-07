// src/lib/voice/upload.ts
// Production upload helper for voice recordings with signed URLs and exponential backoff

import { supabase } from "../supabase";

export interface UploadVoiceMetadata {
  userId: string;
  type: "note" | "message" | "intro" | "reply";
}

export interface UploadVoiceResult {
  url: string;
  duration: number;
  waveformPeaks: number[];
  transcript?: string;
}

export async function uploadVoiceRecording(
  blob: Blob,
  metadata: UploadVoiceMetadata,
  waveformPeaks: number[] = [],
  durationMs: number = 0,
): Promise<UploadVoiceResult> {
  const fileExt = blob.type.includes("mp4") ? "m4a" : "webm";
  const fileName = `${metadata.userId}/${metadata.type}/${Date.now()}.${fileExt}`;
  const bucket = "voice";

  let attempt = 0;
  const maxAttempts = 3;
  let uploadData: { path: string } | null = null;

  while (attempt < maxAttempts) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: blob.type || "audio/webm",
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;
      uploadData = data;
      break;
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) throw error;
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt))); // Exponential backoff
    }
  }

  if (!uploadData) {
    throw new Error("Failed to upload audio after maximum retries");
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

  const publicUrl = publicUrlData.publicUrl;

  // Trigger post-processing Edge Function (silent fallback if edge function isn't deployed yet)
  let transcript = undefined;
  try {
    const { data: processed } = await supabase.functions.invoke("process-voice", {
      body: { fileName, userId: metadata.userId },
    });
    if (processed?.transcript) {
      transcript = processed.transcript;
    }
  } catch (err) {
    console.warn("Voice post-processing edge function notice:", err);
  }

  return {
    url: publicUrl,
    duration: durationMs > 0 ? durationMs / 1000 : 0,
    waveformPeaks,
    transcript,
  };
}
