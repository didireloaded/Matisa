import { supabase } from "@/lib/supabase";
import type {
  MatisaEvent,
  CreateEventInput,
  UpdateEventInput,
  EventHostRecord,
  EventRole,
} from "../types";

export class EventRepository {
  async createDraft(hostId: string, input: CreateEventInput): Promise<MatisaEvent> {
    const payload = {
      host_id: hostId,
      created_by: hostId,
      title: input.title,
      description: input.description,
      cover_storage_path: input.cover_storage_path,
      cover_url: input.cover_url,
      category: input.category,
      event_type: input.event_type || "live_audio",
      access_model: input.access_model || "free_public",
      visibility: input.visibility || "public",
      status: "draft",
      start_at: input.start_at,
      end_at: input.end_at,
      timezone: input.timezone || "UTC",
      max_attendees: input.max_attendees,
      price_minor: input.price_minor || 0,
      currency: input.currency || "NAD",
      chat_enabled: input.chat_enabled ?? true,
      reactions_enabled: input.reactions_enabled ?? true,
      questions_enabled: input.questions_enabled ?? true,
      stage_requests_enabled: input.stage_requests_enabled ?? true,
      recording_enabled: input.recording_enabled ?? false,
      replay_policy: input.replay_policy || "none",
      refund_policy: input.refund_policy,
      location_name: input.location_name,
      location_address: input.location_address,
      latitude: input.latitude,
      longitude: input.longitude,
    };

    const { data, error } = await supabase.from("events").insert(payload).select().single();

    if (error) {
      throw new Error(`Failed to create event draft: ${error.message}`);
    }

    // Automatically add host as role 'host'
    await supabase.from("event_hosts").insert({
      event_id: data.id,
      user_id: hostId,
      role: "host",
    });

    return data as MatisaEvent;
  }

  async updateEvent(
    eventId: string,
    hostId: string,
    input: UpdateEventInput,
  ): Promise<MatisaEvent> {
    const { data, error } = await supabase
      .from("events")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .match({ id: eventId, host_id: hostId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event ${eventId}: ${error.message}`);
    }

    return data as MatisaEvent;
  }

  async findById(eventId: string): Promise<MatisaEvent | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*, hosts:event_hosts(*)")
      .eq("id", eventId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find event ${eventId}: ${error.message}`);
    }

    return data as MatisaEvent;
  }

  async findByHostId(hostId: string): Promise<MatisaEvent[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*, hosts:event_hosts(*)")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events for host ${hostId}: ${error.message}`);
    }

    return (data || []) as MatisaEvent[];
  }

  async publishEvent(eventId: string, hostId: string): Promise<MatisaEvent> {
    const { data, error } = await supabase
      .from("events")
      .update({
        status: "scheduled",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .match({ id: eventId, host_id: hostId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish event ${eventId}: ${error.message}`);
    }

    return data as MatisaEvent;
  }

  async cancelEvent(eventId: string, hostId: string): Promise<MatisaEvent> {
    const { data, error } = await supabase
      .from("events")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .match({ id: eventId, host_id: hostId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel event ${eventId}: ${error.message}`);
    }

    return data as MatisaEvent;
  }

  async addHostRole(
    eventId: string,
    targetUserId: string,
    role: EventRole,
  ): Promise<EventHostRecord> {
    const { data, error } = await supabase
      .from("event_hosts")
      .upsert(
        {
          event_id: eventId,
          user_id: targetUserId,
          role,
        },
        { onConflict: "event_id,user_id" },
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to assign role ${role}: ${error.message}`);
    }

    return data as EventHostRecord;
  }
}

export const eventRepository = new EventRepository();
