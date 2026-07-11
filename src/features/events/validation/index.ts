import { z } from "zod";

export const eventTypeSchema = z.enum(["live_video", "live_audio", "physical", "hybrid"]);
export const accessModelSchema = z.enum([
  "free_public",
  "free_private",
  "invite_only",
  "paid_ticket",
  "free_with_tips",
]);
export const visibilitySchema = z.enum(["public", "unlisted", "private"]);
export const eventStatusSchema = z.enum(["draft", "scheduled", "live", "ended", "cancelled"]);
export const replayPolicySchema = z.enum(["none", "host_only", "ticket_holders", "free_public"]);

export const baseEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z.string().max(2000, "Description must not exceed 2000 characters").optional(),
  cover_storage_path: z.string().optional(),
  cover_url: z.string().url("Invalid cover URL").optional(),
  category: z.string().max(50).optional(),
  event_type: eventTypeSchema.default("live_audio"),
  access_model: accessModelSchema.default("free_public"),
  visibility: visibilitySchema.default("public"),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  timezone: z.string().default("UTC"),
  max_attendees: z.number().int().positive("Capacity must be positive").optional(),
  price_minor: z
    .number()
    .int()
    .nonnegative("Price must be 0 or positive integer minor units")
    .default(0),
  currency: z.string().length(3).default("NAD"),
  chat_enabled: z.boolean().default(true),
  reactions_enabled: z.boolean().default(true),
  questions_enabled: z.boolean().default(true),
  stage_requests_enabled: z.boolean().default(true),
  recording_enabled: z.boolean().default(false),
  replay_policy: replayPolicySchema.default("none"),
  refund_policy: z
    .object({
      allow_refunds: z.boolean(),
      refund_window_hours: z.number().int().nonnegative().optional(),
      terms: z.string().optional(),
    })
    .optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

function applyEventRefinements<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .refine(
      (data: any) => {
        if (
          data.access_model === "paid_ticket" &&
          (data.price_minor === undefined || data.price_minor <= 0)
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Paid ticket events require a price strictly greater than 0 minor units.",
        path: ["price_minor"],
      },
    )
    .refine(
      (data: any) => {
        if (
          (data.event_type === "physical" || data.event_type === "hybrid") &&
          !data.location_name &&
          !data.location_address
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Physical and hybrid events require a location name or address.",
        path: ["location_name"],
      },
    )
    .refine(
      (data: any) => {
        if (data.start_at && data.end_at) {
          return new Date(data.end_at).getTime() > new Date(data.start_at).getTime();
        }
        return true;
      },
      {
        message: "End time must be after start time.",
        path: ["end_at"],
      },
    );
}

export const createEventSchema = applyEventRefinements(baseEventSchema);

export const updateEventSchema = applyEventRefinements(
  baseEventSchema.partial().extend({
    status: eventStatusSchema.optional(),
  }),
);
