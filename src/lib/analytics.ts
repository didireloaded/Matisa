import posthog from "posthog-js";
import * as Sentry from "@sentry/react";

export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

let isInitialized = false;

export const Analytics = {
  init: () => {
    if (typeof window !== "undefined" && !isInitialized) {
      if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          loaded: (posthog) => {
            if (import.meta.env.DEV) {
              posthog.debug();
            }
          },
          autocapture: false,
        });
      }

      if (SENTRY_DSN) {
        Sentry.init({
          dsn: SENTRY_DSN,
          integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
      }
      isInitialized = true;
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (!POSTHOG_KEY) {
      console.log("📊 [Analytics Identify]", userId, properties);
      return;
    }
    posthog.identify(userId, properties);
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    if (!POSTHOG_KEY) {
      console.log("📊 [Analytics Track]", eventName, properties);
      return;
    }
    posthog.capture(eventName, properties);
  },

  reset: () => {
    if (POSTHOG_KEY) {
      posthog.reset();
    }
  },
};
