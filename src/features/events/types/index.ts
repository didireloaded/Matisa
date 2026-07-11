export type EventType = "live_video" | "live_audio" | "physical" | "hybrid";

export type AccessModel =
  | "free_public"
  | "free_private"
  | "invite_only"
  | "paid_ticket"
  | "free_with_tips";

export type EventStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled";

export type EventVisibility = "public" | "unlisted" | "private";

export type EventRole = "host" | "cohost" | "moderator" | "speaker";

export type ReplayPolicy = "none" | "host_only" | "ticket_holders" | "free_public";

export type StageRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface RefundPolicy {
  allow_refunds: boolean;
  refund_window_hours?: number;
  terms?: string;
}

export interface MatisaEvent {
  id: string;
  host_id: string;
  created_by: string;
  title: string;
  description?: string;
  cover_storage_path?: string;
  cover_url?: string;
  category?: string;
  event_type: EventType;
  access_model: AccessModel;
  visibility: EventVisibility;
  status: EventStatus;
  start_at?: string;
  end_at?: string;
  timezone: string;
  max_attendees?: number;
  price_minor: number;
  currency: string;
  chat_enabled: boolean;
  reactions_enabled: boolean;
  questions_enabled: boolean;
  stage_requests_enabled: boolean;
  recording_enabled: boolean;
  replay_policy: ReplayPolicy;
  refund_policy?: RefundPolicy;
  livekit_room_name?: string;
  location_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  published_at?: string;
  started_at?: string;
  ended_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  // relations
  hosts?: EventHostRecord[];
}

export interface EventHostRecord {
  id: string;
  event_id: string;
  user_id: string;
  role: EventRole;
  created_at: string;
}

export interface EventBanRecord {
  id: string;
  event_id: string;
  user_id: string;
  reason?: string;
  banned_by?: string;
  created_at: string;
}

export interface EventStageRequestRecord {
  id: string;
  event_id: string;
  user_id: string;
  status: StageRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  cover_storage_path?: string;
  cover_url?: string;
  category?: string;
  event_type?: EventType;
  access_model?: AccessModel;
  visibility?: EventVisibility;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  max_attendees?: number;
  price_minor?: number;
  currency?: string;
  chat_enabled?: boolean;
  reactions_enabled?: boolean;
  questions_enabled?: boolean;
  stage_requests_enabled?: boolean;
  recording_enabled?: boolean;
  replay_policy?: ReplayPolicy;
  refund_policy?: RefundPolicy;
  location_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}
