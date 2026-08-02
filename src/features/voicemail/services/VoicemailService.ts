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
}
