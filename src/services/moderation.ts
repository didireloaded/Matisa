import { supabase } from "@/lib/supabase";

export interface SubmitReportInput {
  targetType: "user" | "note" | "message" | "room" | "story" | "event";
  targetId: string;
  reason: string;
  details?: string;
}

export const ModerationService = {
  /**
   * Submit a formal moderation report.
   */
  async submitReport(input: SubmitReportInput): Promise<string> {
    const { data, error } = await supabase.rpc("submit_report", {
      p_target_type: input.targetType,
      p_target_id: input.targetId,
      p_reason: input.reason,
      p_details: input.details || null,
    });

    if (error) {
      // Fallback to direct insertion if RPC is not present
      const { data: directData, error: directErr } = await supabase
        .from("reports")
        .insert({
          target_type: input.targetType,
          target_id: input.targetId,
          reason: input.reason,
          details: input.details || null,
        })
        .select("id")
        .single();

      if (directErr) throw directErr;
      return directData.id;
    }

    return data;
  },

  /**
   * Mute a user.
   */
  async muteUser(targetUserId: string): Promise<void> {
    const { error } = await supabase.rpc("mute_user", {
      p_muted_id: targetUserId,
    });
    if (error) {
      const { error: directErr } = await supabase.from("mutes").insert({ muted_id: targetUserId });
      if (directErr && directErr.code !== "23505") throw directErr;
    }
  },

  /**
   * Unmute a user.
   */
  async unmuteUser(targetUserId: string): Promise<void> {
    const { error } = await supabase.rpc("unmute_user", {
      p_muted_id: targetUserId,
    });
    if (error) {
      const { error: directErr } = await supabase
        .from("mutes")
        .delete()
        .eq("muted_id", targetUserId);
      if (directErr) throw directErr;
    }
  },

  /**
   * Block a user.
   */
  async blockUser(targetUserId: string): Promise<void> {
    const { error } = await supabase.rpc("block_user", {
      p_blocked_id: targetUserId,
    });
    if (error) {
      const { error: directErr } = await supabase
        .from("blocks")
        .insert({ blocked_id: targetUserId });
      if (directErr && directErr.code !== "23505") throw directErr;
    }
  },

  /**
   * Unblock a user.
   */
  async unblockUser(targetUserId: string): Promise<void> {
    const { error } = await supabase.rpc("unblock_user", {
      p_blocked_id: targetUserId,
    });
    if (error) {
      const { error: directErr } = await supabase
        .from("blocks")
        .delete()
        .eq("blocked_id", targetUserId);
      if (directErr) throw directErr;
    }
  },
};
