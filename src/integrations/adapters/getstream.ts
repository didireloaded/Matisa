import { isIntegrationAvailable } from "../status";

export const getstreamAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("getstream");
  },

  getApiKey(): string | null {
    if (!this.isAvailable()) return null;
    return import.meta.env.VITE_STREAM_API_KEY || import.meta.env.STREAM_API_KEY || null;
  },
};
