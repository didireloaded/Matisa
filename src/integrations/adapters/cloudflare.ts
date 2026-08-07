import { isIntegrationAvailable } from "../status";

export const cloudflareAdapter = {
  isTurnstileAvailable(): boolean {
    return isIntegrationAvailable("cloudflare");
  },

  getTurnstileSiteKey(): string | null {
    if (!this.isTurnstileAvailable()) return null;
    return import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.TURNSTILE_SITE_KEY || null;
  },
};
