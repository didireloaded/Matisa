import { EventRepository, eventRepository } from "../repositories/EventRepository";
import { createEventSchema, updateEventSchema } from "../validation";
import type {
  MatisaEvent,
  CreateEventInput,
  UpdateEventInput,
  EventRole,
  EventHostRecord,
} from "../types";

export class EventService {
  constructor(private repo: EventRepository = eventRepository) {}

  async createDraft(hostId: string, input: CreateEventInput): Promise<MatisaEvent> {
    if (!hostId) {
      throw new Error("User must be authenticated to create an event.");
    }

    const validation = createEventSchema.safeParse(input);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    return this.repo.createDraft(hostId, validation.data as CreateEventInput);
  }

  async updateDraft(
    eventId: string,
    hostId: string,
    input: UpdateEventInput,
  ): Promise<MatisaEvent> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new Error("Event not found.");
    }
    if (existing.host_id !== hostId && existing.created_by !== hostId) {
      throw new Error("Unauthorized: Only the event host can update this event.");
    }
    if (existing.status === "ended" || existing.status === "cancelled") {
      throw new Error(`Cannot update an event in status '${existing.status}'.`);
    }

    const validation = updateEventSchema.safeParse(input);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    return this.repo.updateEvent(eventId, hostId, validation.data as UpdateEventInput);
  }

  async publishEvent(eventId: string, hostId: string): Promise<MatisaEvent> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new Error("Event not found.");
    }
    if (existing.host_id !== hostId && existing.created_by !== hostId) {
      throw new Error("Unauthorized: Only the event host can publish this event.");
    }
    if (existing.status !== "draft") {
      throw new Error(`Only draft events can be published. Current status: '${existing.status}'.`);
    }

    // Strict requirements for publishing
    if (!existing.start_at) {
      throw new Error("Publishing requires a start time (start_at).");
    }
    if (new Date(existing.start_at).getTime() < Date.now() - 5 * 60 * 1000) {
      throw new Error("Start time cannot be in the past.");
    }
    if (
      existing.access_model === "paid_ticket" &&
      (!existing.price_minor || existing.price_minor <= 0)
    ) {
      throw new Error("Paid ticket events must have a price strictly greater than 0 minor units.");
    }

    return this.repo.publishEvent(eventId, hostId);
  }

  async cancelEvent(eventId: string, hostId: string): Promise<MatisaEvent> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new Error("Event not found.");
    }
    if (existing.host_id !== hostId && existing.created_by !== hostId) {
      throw new Error("Unauthorized: Only the event host can cancel this event.");
    }
    if (existing.status === "cancelled") {
      return existing; // Idempotent
    }
    if (existing.status === "ended") {
      throw new Error("Cannot cancel an event that has already ended.");
    }

    return this.repo.cancelEvent(eventId, hostId);
  }

  async assignHostRole(
    eventId: string,
    actingHostId: string,
    targetUserId: string,
    role: EventRole,
  ): Promise<EventHostRecord> {
    const existing = await this.repo.findById(eventId);
    if (!existing) {
      throw new Error("Event not found.");
    }
    if (existing.host_id !== actingHostId && existing.created_by !== actingHostId) {
      throw new Error("Unauthorized: Only the primary event host can assign roles.");
    }

    return this.repo.addHostRole(eventId, targetUserId, role);
  }
}

export const eventService = new EventService();
