import posthog from "posthog-js";
import * as Sentry from "@sentry/react";

export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

let isInitialized = false;
let isPostHogInitialized = false;

export const Analytics = {
  init: () => {
    if (typeof window !== "undefined" && !isInitialized) {
      if (!POSTHOG_KEY || !POSTHOG_HOST) {
        if (import.meta.env.DEV) {
          const missingVariable = POSTHOG_KEY ? "VITE_POSTHOG_HOST" : "VITE_POSTHOG_KEY";
          throw new Error(
            `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
          );
        }
      } else {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          defaults: "2026-05-30",
          capture_exceptions: {
            capture_unhandled_errors: true,
            capture_unhandled_rejections: true,
            capture_console_errors: false,
          },
          loaded: (posthog) => {
            if (import.meta.env.DEV) {
              posthog.debug();
            }
          },
        });
        isPostHogInitialized = true;
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
    if (isPostHogInitialized) {
      posthog.identify(userId, properties);
    }
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    if (isPostHogInitialized) {
      posthog.capture(eventName, properties);
    }
  },

  reset: () => {
    if (isPostHogInitialized) {
      posthog.reset();
    }
  },
};
