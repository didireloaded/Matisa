// src/features/recorded-voice/mime.ts

export interface MimeOption {
  mimeType: string;
  extension: string;
}

const CANDIDATE_MIME_TYPES: MimeOption[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/aac", extension: "aac" },
  { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
];

export function detectSupportedMimeType(): MimeOption {
  if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
    for (const candidate of CANDIDATE_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
        return candidate;
      }
    }
  }

  // Fallback default
  return { mimeType: "audio/webm", extension: "webm" };
}

export function getExtensionFromMime(mimeType: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("mp4") || normalized.includes("aac") || normalized.includes("m4a")) {
    return "m4a";
  }
  if (normalized.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}
