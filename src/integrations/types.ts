export type IntegrationName =
  | "supabase"
  | "livekit"
  | "onesignal"
  | "resend"
  | "sentry"
  | "posthog"
  | "openai"
  | "paytoday"
  | "mux"
  | "mapbox"
  | "cloudflare"
  | "getstream"
  | "knock"
  | "cloudinary"
  | "algolia";

export interface IntegrationStatus {
  name: IntegrationName;
  displayName: string;
  configured: boolean;
  enabled: boolean;
  reason?: string;
  category:
    | "core"
    | "communication"
    | "observability"
    | "ai"
    | "payments"
    | "video"
    | "location"
    | "infrastructure";
}

export interface FeatureFlags {
  voiceNotes: boolean;
  messaging: boolean;
  stories: boolean;
  events: boolean;
  liveVoiceRooms: boolean;
  karaoke: boolean;
  transcription: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  analytics: boolean;
  errorReporting: boolean;
  paidEvents: boolean;
  virtualVideoShows: boolean;
  interactiveMaps: boolean;
  botProtection: boolean;
}
