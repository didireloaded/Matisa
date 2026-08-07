// src/features/recorded-voice/config.ts

export const VOICE_LIMITS = {
  intro: 30,
  story: 60,
  reply: 120,
  voicemail: 180,
  message: 300,
  note: 300,
} as const;

export type VoiceMode = keyof typeof VOICE_LIMITS;

export const SIGNED_URL_EXPIRES_SECONDS = 600; // 10 minutes
