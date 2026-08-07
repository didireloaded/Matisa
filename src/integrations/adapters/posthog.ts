import posthog from "posthog-js";
import { isIntegrationAvailable } from "../status";

let initialized = false;

export const posthogAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("posthog");
  },

  init(): void {
    if (!this.isAvailable() || initialized || typeof window === "undefined") {
      return;
    }

    const key = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.POSTHOG_KEY;
    const host =
      import.meta.env.VITE_POSTHOG_HOST ||
      import.meta.env.POSTHOG_HOST ||
      "https://us.i.posthog.com";

    if (!key) return;

    try {
      posthog.init(key, {
        api_host: host,
        loaded: (instance) => {
          if (import.meta.env.DEV) {
            instance.debug();
          }
        },
        autocapture: false,
      });
      initialized = true;
      console.log("[PostHog] Analytics initialized.");
    } catch (err: any) {
      console.warn(`[PostHog] Init skipped: ${err?.message}`);
    }
  },

  track(eventName: string, properties?: Record<string, any>): void {
    if (!initialized) {
      if (import.meta.env.DEV) {
        console.log(`📊 [Analytics Track - Safe No-Op] ${eventName}`, properties);
      }
      return;
    }
    posthog.capture(eventName, properties);
  },

  identify(userId: string, properties?: Record<string, any>): void {
    if (!initialized) {
      if (import.meta.env.DEV) {
        console.log(`📊 [Analytics Identify - Safe No-Op] ${userId}`, properties);
      }
      return;
    }
    posthog.identify(userId, properties);
  },

  reset(): void {
    if (!initialized) return;
    posthog.reset();
  },
};
