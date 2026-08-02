import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventService } from "./EventService";
import type { EventRepository } from "../repositories/EventRepository";
import type {
  MatisaEvent,
  CreateEventInput,
  UpdateEventInput,
  EventTicketRecord,
  EventInviteRecord,
} from "../types";

describe("EventService Domain & Lifecycle Tests (Phase 1)", () => {
  let service: EventService;
  let mockRepo: unknown;
  let fakeEvents: Record<string, MatisaEvent>;
  let fakeTickets: Record<string, EventTicketRecord>;
  let fakeInvites: Record<string, EventInviteRecord>;
  let fakeBans: Set<string>;
  let attendeeCount: number;

  beforeEach(() => {
    fakeEvents = {};
    fakeTickets = {};
    fakeInvites = {};
    fakeBans = new Set();
    attendeeCount = 0;

    mockRepo = {
      createDraft: vi.fn(async (hostId: string, input: CreateEventInput) => {
        const id = `event_${Object.keys(fakeEvents).length + 1}`;
        const newEvent: MatisaEvent = {
          id,
          host_id: hostId,
          created_by: hostId,
          title: input.title,
          description: input.description,
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
          location_name: input.location_name,
          location_address: input.location_address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        fakeEvents[id] = newEvent;
        return newEvent;
      }),

      findById: vi.fn(async (eventId: string) => {
        return fakeEvents[eventId] || null;
      }),

      updateEvent: vi.fn(async (eventId: string, hostId: string, input: UpdateEventInput) => {
        const ev = fakeEvents[eventId];
        if (!ev) throw new Error("Event not found");
        const updated = { ...ev, ...input, updated_at: new Date().toISOString() };
        fakeEvents[eventId] = updated;
        return updated;
      }),

      publishEvent: vi.fn(async (eventId: string, hostId: string) => {
        const ev = fakeEvents[eventId];
        if (!ev) throw new Error("Event not found");
        const updated = {
          ...ev,
          status: "scheduled" as const,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        fakeEvents[eventId] = updated;
        return updated;
      }),

      cancelEvent: vi.fn(async (eventId: string, hostId: string) => {
        const ev = fakeEvents[eventId];
        if (!ev) throw new Error("Event not found");
        const updated = {
          ...ev,
          status: "cancelled" as const,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        fakeEvents[eventId] = updated;
        return updated;
      }),

      addHostRole: vi.fn(async (eventId: string, targetUserId: string, role: any) => {
        return {
          id: `host_record_${Math.random()}`,
          event_id: eventId,
          user_id: targetUserId,
          role,
          created_at: new Date().toISOString(),
        };
      }),

      countActiveAttendees: vi.fn(async () => attendeeCount),

      findBan: vi.fn(async (eventId: string, userId: string) => {
        return fakeBans.has(`${eventId}:${userId}`) ? { id: "ban_1" } : null;
      }),

      findInvite: vi.fn(async (eventId: string, userId: string) => {
        return fakeInvites[`${eventId}:${userId}`] || null;
      }),

      findValidTicket: vi.fn(async (eventId: string, userId: string) => {
        return fakeTickets[`${eventId}:${userId}`] || null;
      }),

      upsertAttendance: vi.fn(async (eventId: string, userId: string, role: any) => {
        attendeeCount += 1;
        return {
          id: `attendee_${attendeeCount}`,
          event_id: eventId,
          user_id: userId,
          role,
          status: "checked_in",
          joined_at: new Date().toISOString(),
          checked_in_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }),
    };

    service = new EventService(mockRepo as EventRepository);
  });

  describe("createDraft", () => {
    it("throws error when user is not authenticated", async () => {
      await expect(service.createDraft("", { title: "Test Event" })).rejects.toThrow(
        "User must be authenticated",
      );
    });

    it("throws error when title is too short (< 3 characters)", async () => {
      await expect(service.createDraft("user_1", { title: "Ab" })).rejects.toThrow(
        "Title must be at least 3 characters",
      );
    });

    it("throws error when paid_ticket access_model has price 0 or missing", async () => {
      await expect(
        service.createDraft("user_1", {
          title: "Paid Live Concert",
          access_model: "paid_ticket",
          price_minor: 0,
        }),
      ).rejects.toThrow("Paid ticket events require a price strictly greater than 0");
    });

    it("throws error when physical event lacks location name or address", async () => {
      await expect(
        service.createDraft("user_1", {
          title: "Physical Meetup",
          event_type: "physical",
        }),
      ).rejects.toThrow("Physical and hybrid events require a location name or address");
    });

    it("creates draft successfully with default values", async () => {
      const draft = await service.createDraft("user_1", { title: "Awesome Live Audio Room" });
      expect(draft.id).toBe("event_1");
      expect(draft.host_id).toBe("user_1");
      expect(draft.status).toBe("draft");
      expect(draft.event_type).toBe("live_audio");
      expect(draft.access_model).toBe("free_public");
      expect(draft.price_minor).toBe(0);
    });
  });

  describe("updateDraft", () => {
    it("throws error if event does not exist", async () => {
      await expect(
        service.updateDraft("non_existent", "user_1", { title: "New Title" }),
      ).rejects.toThrow("Event not found");
    });

    it("throws unauthorized error if caller is not host or creator", async () => {
      const draft = await service.createDraft("user_1", { title: "My Draft Event" });
      await expect(
        service.updateDraft(draft.id, "unauthorized_user", { title: "Hacked Title" }),
      ).rejects.toThrow("Unauthorized");
    });

    it("throws error if updating an event that already ended or was cancelled", async () => {
      const draft = await service.createDraft("user_1", { title: "To Be Cancelled" });
      await service.cancelEvent(draft.id, "user_1");
      await expect(
        service.updateDraft(draft.id, "user_1", { title: "Update After Cancel" }),
      ).rejects.toThrow("Cannot update an event in status 'cancelled'");
    });

    it("updates draft fields successfully when authorized", async () => {
      const draft = await service.createDraft("user_1", { title: "Old Title" });
      const updated = await service.updateDraft(draft.id, "user_1", {
        title: "Updated Title",
        description: "Fresh notes",
      });
      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("Fresh notes");
    });
  });

  describe("publishEvent", () => {
    it("throws error if start time (start_at) is missing", async () => {
      const draft = await service.createDraft("user_1", { title: "No Start Time Event" });
      await expect(service.publishEvent(draft.id, "user_1")).rejects.toThrow(
        "Publishing requires a start time (start_at)",
      );
    });

    it("throws error if start time is in the past", async () => {
      const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
      const draft = await service.createDraft("user_1", {
        title: "Past Event",
        start_at: pastDate,
      });
      await expect(service.publishEvent(draft.id, "user_1")).rejects.toThrow(
        "Start time cannot be in the past",
      );
    });

    it("publishes successfully and sets status to scheduled when requirements are met", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("user_1", {
        title: "Ready for Launch",
        start_at: futureDate,
      });
      const published = await service.publishEvent(draft.id, "user_1");
      expect(published.status).toBe("scheduled");
      expect(published.published_at).toBeDefined();
    });
  });

  describe("cancelEvent", () => {
    it("cancels a draft or scheduled event cleanly", async () => {
      const draft = await service.createDraft("user_1", { title: "Will Be Cancelled" });
      const cancelled = await service.cancelEvent(draft.id, "user_1");
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelled_at).toBeDefined();
    });

    it("is idempotent when cancelling twice", async () => {
      const draft = await service.createDraft("user_1", { title: "Idempotent Cancel" });
      await service.cancelEvent(draft.id, "user_1");
      const secondCancel = await service.cancelEvent(draft.id, "user_1");
      expect(secondCancel.status).toBe("cancelled");
    });
  });

  describe("assignHostRole", () => {
    it("allows the primary host to assign roles to other users", async () => {
      const draft = await service.createDraft("user_1", { title: "Team Event" });
      const roleRecord = await service.assignHostRole(draft.id, "user_1", "user_2", "cohost");
      expect(roleRecord.user_id).toBe("user_2");
      expect(roleRecord.role).toBe("cohost");
    });

    it("prevents non-primary hosts from assigning roles", async () => {
      const draft = await service.createDraft("user_1", { title: "Team Event" });
      await expect(
        service.assignHostRole(draft.id, "user_3", "user_4", "moderator"),
      ).rejects.toThrow("Unauthorized: Only the primary event host can assign roles.");
    });
  });

  describe("evaluateJoinAccess", () => {
    it("requires authentication before joining", async () => {
      const decision = await service.evaluateJoinAccess("event_1", null);
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe("authentication_required");
    });

    it("denies paid ticket access until a verified ticket exists", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("host_1", {
        title: "Paid Workshop",
        access_model: "paid_ticket",
        price_minor: 5000,
        start_at: futureDate,
      });
      await service.publishEvent(draft.id, "host_1");

      const decision = await service.evaluateJoinAccess(draft.id, "buyer_1");

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe("ticket_required");
    });

    it("allows paid ticket access only when a paid or used ticket exists", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("host_1", {
        title: "Paid Class",
        access_model: "paid_ticket",
        price_minor: 7500,
        start_at: futureDate,
      });
      await service.publishEvent(draft.id, "host_1");
      fakeTickets[`${draft.id}:buyer_1`] = {
        id: "ticket_1",
        event_id: draft.id,
        buyer_id: "buyer_1",
        ticket_status: "paid",
        amount_paid_minor: 7500,
        currency: "NAD",
        purchased_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const decision = await service.evaluateJoinAccess(draft.id, "buyer_1");

      expect(decision.allowed).toBe(true);
      expect(decision.ticket?.ticket_status).toBe("paid");
    });

    it("requires an invite for invite-only events", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("host_1", {
        title: "Private Conversation",
        access_model: "invite_only",
        visibility: "private",
        start_at: futureDate,
      });
      await service.publishEvent(draft.id, "host_1");

      const blocked = await service.evaluateJoinAccess(draft.id, "listener_1");
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toBe("invite_required");

      fakeInvites[`${draft.id}:listener_1`] = {
        id: "invite_1",
        event_id: draft.id,
        invited_user_id: "listener_1",
        invited_by: "host_1",
        created_at: new Date().toISOString(),
      };
      const allowed = await service.evaluateJoinAccess(draft.id, "listener_1");
      expect(allowed.allowed).toBe(true);
    });

    it("denies banned attendees even when the event is public", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("host_1", {
        title: "Public Audio",
        start_at: futureDate,
      });
      await service.publishEvent(draft.id, "host_1");
      fakeBans.add(`${draft.id}:listener_1`);

      const decision = await service.evaluateJoinAccess(draft.id, "listener_1");

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe("banned");
    });

    it("enforces capacity for attendees", async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
      const draft = await service.createDraft("host_1", {
        title: "Small Room",
        max_attendees: 1,
        start_at: futureDate,
      });
      await service.publishEvent(draft.id, "host_1");
      attendeeCount = 1;

      const decision = await service.evaluateJoinAccess(draft.id, "listener_1");

      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe("capacity_full");
    });

    it("allows the host to enter before the event is public", async () => {
      const draft = await service.createDraft("host_1", { title: "Host Setup" });

      const decision = await service.evaluateJoinAccess(draft.id, "host_1");

      expect(decision.allowed).toBe(true);
      expect(decision.role).toBe("host");
    });
  });
});
