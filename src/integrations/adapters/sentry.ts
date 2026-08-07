import * as Sentry from "@sentry/react";
import { isIntegrationAvailable } from "../status";

let initialized = false;

export const sentryAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("sentry");
  },

  init(): void {
    if (!this.isAvailable() || initialized || typeof window === "undefined") {
      return;
    }

    const dsn = import.meta.env.VITE_SENTRY_DSN || import.meta.env.SENTRY_DSN;
    if (!dsn) return;

    try {
      Sentry.init({
        dsn,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        enableLogs: import.meta.env.DEV,
        beforeSend(event) {
          // Sanitization check: Ensure no tokens or credentials leak
          if (event.request?.headers) {
            delete event.request.headers["authorization"];
            delete event.request.headers["x-client-info"];
          }
          return event;
        },
      });
      initialized = true;
      console.log("[Sentry] Error tracking initialized.");
    } catch (err: any) {
      console.warn(`[Sentry] Init skipped: ${err?.message}`);
    }
  },

  captureException(error: any, context?: Record<string, any>): void {
    if (!initialized) {
      if (import.meta.env.DEV) {
        console.error("[Sentry Fallback Error]", error, context);
      }
      return;
    }
    Sentry.captureException(error, { extra: context });
  },

  captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
    if (!initialized) {
      if (import.meta.env.DEV) {
        console.log(`[Sentry Fallback ${level.toUpperCase()}]`, message);
      }
      return;
    }
    Sentry.captureMessage(message, level);
  },

  setUser(user: { id: string; email?: string } | null): void {
    if (!initialized) return;
    Sentry.setUser(user);
  },
};
