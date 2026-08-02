export type VoicemailStatus = "unread" | "read" | "deleted";

export type VoicemailMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  storage_path: string;
  audio_url?: string | null;
  duration_seconds: number;
  status: VoicemailStatus;
  created_at: string;
  listened_at?: string | null;
};

export type CreateVoicemailInput = {
  senderId: string;
  recipientId: string;
  audioBlob: Blob;
  durationSeconds: number;
};

export type CreateVoicemailRecordInput = {
  senderId: string;
  recipientId: string;
  storagePath: string;
  durationSeconds: number;
};
