import { describe, expect, it, vi } from "vitest";
import { VoicemailService, type VoicemailStore } from "./VoicemailService";

function makeStore(): VoicemailStore {
  return {
    uploadAudio: vi.fn(async () => "recipient/sender/test.webm"),
    createRecord: vi.fn(async (input) => ({
      id: "vm_1",
      sender_id: input.senderId,
      recipient_id: input.recipientId,
      storage_path: input.storagePath,
      duration_seconds: input.durationSeconds,
      status: "unread" as const,
      created_at: new Date().toISOString(),
    })),
    listInbox: vi.fn(async () => [
      {
        id: "vm_1",
        sender_id: "sender",
        recipient_id: "recipient",
        storage_path: "recipient/sender/test.webm",
        duration_seconds: 3,
        status: "unread" as const,
        created_at: new Date().toISOString(),
      },
    ]),
    createSignedPlaybackUrl: vi.fn(async () => "https://signed.example/audio.webm"),
    updateStatus: vi.fn(async () => undefined),
  };
}

describe("VoicemailService", () => {
  it("uploads audio and creates an unread voicemail record", async () => {
    const store = makeStore();
    const service = new VoicemailService(store);
    const blob = new Blob(["audio"], { type: "audio/webm" });

    const message = await service.leaveVoicemail({
      senderId: "sender",
      recipientId: "recipient",
      audioBlob: blob,
      durationSeconds: 4,
    });

    expect(message.status).toBe("unread");
    expect(store.uploadAudio).toHaveBeenCalledWith("sender", "recipient", blob);
    expect(store.createRecord).toHaveBeenCalledWith({
      senderId: "sender",
      recipientId: "recipient",
      storagePath: "recipient/sender/test.webm",
      durationSeconds: 4,
    });
  });

  it("does not let users leave voicemail for themselves", async () => {
    const store = makeStore();
    const service = new VoicemailService(store);

    await expect(
      service.leaveVoicemail({
        senderId: "same-user",
        recipientId: "same-user",
        audioBlob: new Blob(["audio"]),
        durationSeconds: 2,
      }),
    ).rejects.toThrow("You cannot leave voicemail for yourself.");
    expect(store.uploadAudio).not.toHaveBeenCalled();
  });

  it("returns inbox messages with signed playback URLs", async () => {
    const store = makeStore();
    const service = new VoicemailService(store);

    const inbox = await service.getInbox("recipient");

    expect(inbox[0].audio_url).toBe("https://signed.example/audio.webm");
    expect(store.createSignedPlaybackUrl).toHaveBeenCalledWith("recipient/sender/test.webm");
  });
});
