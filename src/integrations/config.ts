import { IntegrationName, IntegrationStatus, FeatureFlags } from "./types";

function getEnvVar(key: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

export function checkIntegrationStatus(name: IntegrationName): IntegrationStatus {
  switch (name) {
    case "supabase": {
      const url = getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL");
      const key =
        getEnvVar("VITE_SUPABASE_ANON_KEY") ||
        getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") ||
        getEnvVar("SUPABASE_PUBLISHABLE_KEY");
      const configured = Boolean(url && key && !url.includes("your-project-url"));
      return {
        name,
        displayName: "Supabase",
        configured,
        enabled: configured,
        reason: configured ? "Ready" : "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
        category: "core",
      };
    }

    case "livekit": {
      const url = getEnvVar("VITE_LIVEKIT_URL") || getEnvVar("LIVEKIT_URL");
      const configured = Boolean(url && !url.includes("your-livekit-url"));
      return {
        name,
        displayName: "LiveKit",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Media Transport)" : "Missing VITE_LIVEKIT_URL",
        category: "communication",
      };
    }

    case "onesignal": {
      const appId = getEnvVar("VITE_ONESIGNAL_APP_ID") || getEnvVar("ONESIGNAL_APP_ID");
      const configured = Boolean(appId && !appId.includes("your-onesignal-app-id"));
      return {
        name,
        displayName: "OneSignal",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Push Notifications)" : "Missing VITE_ONESIGNAL_APP_ID",
        category: "communication",
      };
    }

    case "resend": {
      const apiKey = getEnvVar("RESEND_API_KEY");
      const configured = Boolean(apiKey && !apiKey.includes("your-resend-key"));
      return {
        name,
        displayName: "Resend",
        configured,
        enabled: configured,
        reason: configured
          ? "Ready (Server Emails)"
          : "Missing RESEND_API_KEY in server environment",
        category: "communication",
      };
    }

    case "sentry": {
      const dsn = getEnvVar("VITE_SENTRY_DSN") || getEnvVar("SENTRY_DSN");
      const configured = Boolean(dsn && dsn.startsWith("http"));
      return {
        name,
        displayName: "Sentry",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Error Tracking)" : "Missing VITE_SENTRY_DSN",
        category: "observability",
      };
    }

    case "posthog": {
      const key = getEnvVar("VITE_POSTHOG_KEY") || getEnvVar("POSTHOG_KEY");
      const configured = Boolean(key && !key.includes("your-posthog-key"));
      return {
        name,
        displayName: "PostHog",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Product Analytics)" : "Missing VITE_POSTHOG_KEY",
        category: "observability",
      };
    }

    case "openai": {
      const key = getEnvVar("OPENAI_API_KEY") || getEnvVar("VITE_OPENAI_API_KEY");
      const configured = Boolean(key && !key.includes("your-openai-key"));
      return {
        name,
        displayName: "OpenAI",
        configured,
        enabled: configured,
        reason: configured
          ? "Ready (AI Features)"
          : "Missing OPENAI_API_KEY (server edge function)",
        category: "ai",
      };
    }

    case "paytoday": {
      const key = getEnvVar("PAYTODAY_API_KEY") || getEnvVar("PAYMENT_SECRET");
      const configured = Boolean(key && !key.includes("your-paytoday-key"));
      return {
        name,
        displayName: "PayToday",
        configured,
        enabled: configured,
        reason: configured
          ? "Ready (Paid Events)"
          : "Missing PAYTODAY_API_KEY in server environment",
        category: "payments",
      };
    }

    case "mux": {
      const tokenId = getEnvVar("MUX_TOKEN_ID");
      const configured = Boolean(tokenId && !tokenId.includes("your-mux-token-id"));
      return {
        name,
        displayName: "Mux",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Virtual Video Shows)" : "Missing MUX_TOKEN_ID",
        category: "video",
      };
    }

    case "mapbox": {
      const token = getEnvVar("VITE_MAPBOX_TOKEN") || getEnvVar("MAPBOX_TOKEN");
      const configured = Boolean(token && token.startsWith("pk."));
      return {
        name,
        displayName: "Mapbox",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Interactive Maps)" : "Missing VITE_MAPBOX_TOKEN",
        category: "location",
      };
    }

    case "cloudflare": {
      const siteKey = getEnvVar("VITE_TURNSTILE_SITE_KEY") || getEnvVar("TURNSTILE_SITE_KEY");
      const configured = Boolean(siteKey && !siteKey.includes("your-turnstile-key"));
      return {
        name,
        displayName: "Cloudflare (Turnstile/R2)",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Bot Protection)" : "Missing VITE_TURNSTILE_SITE_KEY",
        category: "infrastructure",
      };
    }

    case "getstream": {
      const apiKey = getEnvVar("VITE_STREAM_API_KEY") || getEnvVar("STREAM_API_KEY");
      const configured = Boolean(apiKey && !apiKey.includes("your-stream-api-key"));
      return {
        name,
        displayName: "GetStream",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Chat & Activity Feeds)" : "Missing VITE_STREAM_API_KEY",
        category: "communication",
      };
    }

    case "knock": {
      const apiKey = getEnvVar("VITE_KNOCK_PUBLIC_API_KEY") || getEnvVar("KNOCK_PUBLIC_API_KEY");
      const configured = Boolean(apiKey && !apiKey.includes("your-knock-public-api-key"));
      return {
        name,
        displayName: "Knock",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Notification Workflows)" : "Missing VITE_KNOCK_PUBLIC_API_KEY",
        category: "communication",
      };
    }

    case "cloudinary": {
      const key = getEnvVar("CLOUDINARY_API_KEY") || getEnvVar("VITE_CLOUDINARY_CLOUD_NAME");
      const configured = Boolean(key && !key.includes("your-cloudinary-api-key"));
      return {
        name,
        displayName: "Cloudinary",
        configured,
        enabled: configured,
        reason: configured ? "Ready (Media Optimization)" : "Missing CLOUDINARY_API_KEY",
        category: "infrastructure",
      };
    }

    case "algolia": {
      const appId = getEnvVar("VITE_ALGOLIA_APP_ID") || getEnvVar("ALGOLIA_APP_ID");
      const searchKey = getEnvVar("VITE_ALGOLIA_SEARCH_KEY") || getEnvVar("ALGOLIA_SEARCH_KEY");
      const configured = Boolean(appId && searchKey && !appId.includes("your-algolia-app-id"));
      return {
        name,
        displayName: "Algolia",
        configured,
        enabled: configured,
        reason: configured
          ? "Ready (Instant Search)"
          : "Missing VITE_ALGOLIA_APP_ID or VITE_ALGOLIA_SEARCH_KEY",
        category: "core",
      };
    }
  }
}

export function computeFeatureFlags(): FeatureFlags {
  const supabase = checkIntegrationStatus("supabase");
  const livekit = checkIntegrationStatus("livekit");
  const onesignal = checkIntegrationStatus("onesignal");
  const resend = checkIntegrationStatus("resend");
  const sentry = checkIntegrationStatus("sentry");
  const posthog = checkIntegrationStatus("posthog");
  const openai = checkIntegrationStatus("openai");
  const paytoday = checkIntegrationStatus("paytoday");
  const mux = checkIntegrationStatus("mux");
  const mapbox = checkIntegrationStatus("mapbox");
  const cloudflare = checkIntegrationStatus("cloudflare");

  return {
    voiceNotes: true, // Core Matisa feature
    messaging: true, // Core Matisa feature
    stories: true, // Core Matisa feature
    events: true, // Core Matisa feature

    liveVoiceRooms: supabase.enabled && livekit.enabled,
    karaoke: supabase.enabled && livekit.enabled,
    transcription: openai.enabled,
    pushNotifications: onesignal.enabled,
    emailNotifications: resend.enabled,
    analytics: posthog.enabled,
    errorReporting: sentry.enabled,
    paidEvents: paytoday.enabled,
    virtualVideoShows: mux.enabled,
    interactiveMaps: mapbox.enabled,
    botProtection: cloudflare.enabled,
  };
}
