// src/features/recorded-voice/storage.ts
import { supabase } from "@/lib/supabase";
import { VoiceMode, SIGNED_URL_EXPIRES_SECONDS } from "./config";
import { RecordedVoice, StorageUploadResult } from "./types";
import { v4 as uuidv4 } from "uuid";

interface CachedSignedUrl {
  url: string;
  expiresAt: number; // timestamp ms
}

// In-memory cache for signed URLs (key: `${bucket}:${path}`)
const signedUrlCache = new Map<string, CachedSignedUrl>();

export function isPrivateVoiceMode(mode: VoiceMode): boolean {
  return mode === "message" || mode === "voicemail" || mode === "reply";
}

export function getStorageBucketForMode(mode: VoiceMode): string {
  switch (mode) {
    case "note":
      return "voice_notes";
    case "intro":
      return "voice_intros";
    case "story":
      return "stories";
    case "message":
      return "voice_messages";
    case "voicemail":
      return "voice_mail";
    case "reply":
      return "voice_replies";
  }
}

export function generateStoragePath(
  mode: VoiceMode,
  userId: string,
  extension: string,
  metadata?: { conversationId?: string; recipientId?: string },
): string {
  const fileId = uuidv4();
  const ext = extension.startsWith(".") ? extension.slice(1) : extension;

  switch (mode) {
    case "note":
      return `voice_notes/${userId}/${fileId}.${ext}`;
    case "intro":
      return `voice_intros/${userId}/${fileId}.${ext}`;
    case "story":
      return `stories/${userId}/${fileId}.${ext}`;
    case "message": {
      const convId = metadata?.conversationId || "general";
      return `${convId}/${userId}/${fileId}.${ext}`;
    }
    case "voicemail": {
      const recId = metadata?.recipientId || "system";
      return `${recId}/${userId}/${fileId}.${ext}`;
    }
    case "reply": {
      const recId = metadata?.recipientId || "system";
      return `${recId}/${userId}/${fileId}.${ext}`;
    }
  }
}

export async function uploadRecordedVoice(
  recording: RecordedVoice,
  mode: VoiceMode,
  userId: string,
  metadata?: { conversationId?: string; recipientId?: string },
): Promise<StorageUploadResult> {
  const bucket = getStorageBucketForMode(mode);
  const path = generateStoragePath(mode, userId, recording.extension, metadata);
  const isPrivate = isPrivateVoiceMode(mode);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, recording.blob, {
    contentType: recording.mimeType || "audio/webm",
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  if (!isPrivate) {
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return {
      path,
      isPrivate: false,
      publicUrl: publicData?.publicUrl || "",
    };
  }

  return {
    path,
    isPrivate: true,
  };
}

export async function getSignedVoiceUrl(
  bucket: "voice_messages" | "voice_mail" | "voice_replies" | string,
  path: string,
): Promise<string | null> {
  if (!path) return null;

  // Check in-memory cache (buffer 60 seconds before expiration)
  const cacheKey = `${bucket}:${path}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt - 60000) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_SECONDS);

    if (error || !data?.signedUrl) {
      console.error("Failed to create signed URL:", error);
      return null;
    }

    const expiresAt = Date.now() + SIGNED_URL_EXPIRES_SECONDS * 1000;
    signedUrlCache.set(cacheKey, { url: data.signedUrl, expiresAt });
    return data.signedUrl;
  } catch (err) {
    console.error("Error in getSignedVoiceUrl:", err);
    return null;
  }
}
