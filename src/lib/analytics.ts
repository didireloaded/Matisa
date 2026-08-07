import { posthogAdapter, sentryAdapter } from "@/integrations";

export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const Analytics = {
  init: () => {
    posthogAdapter.init();
    sentryAdapter.init();
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    posthogAdapter.identify(userId, properties);
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    posthogAdapter.track(eventName, properties);
  },

  reset: () => {
    posthogAdapter.reset();
  },
};
