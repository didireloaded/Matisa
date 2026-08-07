import { isIntegrationAvailable } from "../status";
import { supabaseAdapter } from "./supabase";

export interface EmailPayload {
  to: string;
  subject: string;
  template: "welcome" | "security" | "event_ticket" | "virtual_show";
  data?: Record<string, any>;
}

export const resendAdapter = {
  isAvailable(): boolean {
    return isIntegrationAvailable("resend");
  },

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log(
        `[Resend Email] Skipped email '${payload.template}' to ${payload.to} (Resend not configured)`,
      );
      return false;
    }

    try {
      const supabase = supabaseAdapter.getClient();
      const { error } = await supabase.functions.invoke("send-email", {
        body: payload,
      });

      if (error) {
        console.warn(`[Resend Email] Edge function error: ${error.message}`);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[Resend Email] Network error: ${err?.message}`);
      return false;
    }
  },
};
