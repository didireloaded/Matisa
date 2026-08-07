import OneSignal from "react-onesignal";
import { isIntegrationAvailable } from "../status";
import { supabaseAdapter } from "./supabase";

let initialized = false;

export const onesignalAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("onesignal");
  },

  async init(): Promise<boolean> {
    if (!this.isAvailable() || initialized || typeof window === "undefined") {
      return false;
    }

    try {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || import.meta.env.ONESIGNAL_APP_ID;
      if (!appId) return false;

      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: import.meta.env.DEV,
      });

      initialized = true;
      console.log("[OneSignal] Web push initialized successfully.");
      return true;
    } catch (err: any) {
      console.warn(`[OneSignal] Initialization skipped/failed: ${err?.message}`);
      return false;
    }
  },

  async setExternalUserId(userId: string): Promise<void> {
    if (!initialized) return;
    try {
      await OneSignal.login(userId);
    } catch (err: any) {
      console.warn(`[OneSignal] Login/User identification skipped: ${err?.message}`);
    }
  },

  async sendPushNotification(payload: {
    userIds: string[];
    heading: string;
    content: string;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      return false; // Silently skip secondary side effect
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { error } = await supabase.functions.invoke("send-notification", {
        body: payload,
      });

      if (error) {
        console.warn(`[OneSignal Push] Notification side effect skipped: ${error.message}`);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[OneSignal Push] Notification network error: ${err?.message}`);
      return false;
    }
  },
};
