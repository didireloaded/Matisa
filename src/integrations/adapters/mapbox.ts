import { isIntegrationAvailable } from "../status";

export const mapboxAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("mapbox");
  },

  getToken(): string | null {
    if (!this.isAvailable()) return null;
    return import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.MAPBOX_TOKEN || null;
  },
};
