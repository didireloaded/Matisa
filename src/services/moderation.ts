import { supabase } from "../lib/supabase";
import { Analytics } from "../lib/analytics";

export type ReportType = "post" | "user" | "voice_room" | "event" | "message";

export const ModerationService = {
  /**
   * Submit a report for abusive content, users, or rooms
   */
  async submitReport(
    reporterId: string,
    targetId: string,
    targetType: ReportType,
    reason: string,
    details?: string,
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        target_id: targetId,
        target_type: targetType,
        reason,
        details,
      });

      if (error) throw error;

      Analytics.track("Report Submitted", { targetType, reason });
      return { success: true };
    } catch (error) {
      console.error("Error submitting report:", error);
      return { success: false, error };
    }
  },
};
