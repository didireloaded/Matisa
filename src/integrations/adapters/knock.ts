import { isIntegrationAvailable } from "../status";

export const knockAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("knock");
  },

  getPublicKey(): string | null {
    if (!this.isAvailable()) return null;
    return (
      import.meta.env.VITE_KNOCK_PUBLIC_API_KEY || import.meta.env.KNOCK_PUBLIC_API_KEY || null
    );
  },
};
