import type {
  CreateVoicemailInput,
  CreateVoicemailRecordInput,
  VoicemailMessage,
  VoicemailStatus,
} from "../types";

export interface VoicemailStore {
  uploadAudio(senderId: string, recipientId: string, audioBlob: Blob): Promise<string>;
  createRecord(input: CreateVoicemailRecordInput): Promise<VoicemailMessage>;
  listInbox(userId: string): Promise<VoicemailMessage[]>;
  createSignedPlaybackUrl(storagePath: string): Promise<string>;
  updateStatus(messageId: string, status: VoicemailStatus): Promise<void>;
}

export class VoicemailService {
  constructor(private readonly store: VoicemailStore) {}

  async leaveVoicemail(input: CreateVoicemailInput): Promise<VoicemailMessage> {
    if (!input.senderId) throw new Error("Sign in to leave a voicemail.");
    if (!input.recipientId) throw new Error("Choose a recipient before recording.");
    if (input.senderId === input.recipientId) {
      throw new Error("You cannot leave voicemail for yourself.");
    }
    if (input.durationSeconds < 1) {
      throw new Error("Record at least one second before sending.");
    }

    const storagePath = await this.store.uploadAudio(
      input.senderId,
      input.recipientId,
      input.audioBlob,
    );

    return this.store.createRecord({
      senderId: input.senderId,
      recipientId: input.recipientId,
      storagePath,
      durationSeconds: input.durationSeconds,
    });
  }

  async getInbox(userId: string): Promise<VoicemailMessage[]> {
    if (!userId) return [];
    const messages = await this.store.listInbox(userId);

    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        audio_url: await this.store.createSignedPlaybackUrl(message.storage_path),
      })),
    );
  }

  async markRead(messageId: string): Promise<void> {
    await this.store.updateStatus(messageId, "read");
  }

  static async sendVoicemail(params: {
    senderId: string;
    recipientId: string;
    recording: {
      blob: Blob;
      mimeType: string;
      extension: string;
      durationSeconds: number;
      waveform: number[];
    };
  }) {
    const { supabase } = await import("@/lib/supabase");
    const { uploadRecordedVoice } = await import("@/features/recorded-voice");
    const { VoicemailRepository } = await import("../repositories/VoicemailRepository");

    const repo = new VoicemailRepository(supabase as any);
    const uploadRes = await uploadRecordedVoice(
      params.recording as any,
      "voicemail",
      params.senderId,
      {
        recipientId: params.recipientId,
      },
    );

    return await repo.createRecord({
      senderId: params.senderId,
      recipientId: params.recipientId,
      storagePath: uploadRes.path,
      durationSeconds: params.recording.durationSeconds,
    });
  }
}
