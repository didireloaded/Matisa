import { isIntegrationAvailable } from "../status";

export const cloudinaryAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("cloudinary");
  },

  getCloudName(): string | null {
    if (!this.isAvailable()) return null;
    return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null;
  },
};
