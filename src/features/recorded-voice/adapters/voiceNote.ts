// src/features/recorded-voice/adapters/voiceNote.ts
import { RecordedVoice, uploadRecordedVoice } from "../";
import { NoteService } from "@/services/NoteService";

export async function publishVoiceNoteAdapter(
  recording: RecordedVoice,
  userId: string,
  noteLifetime: "temporary" | "permanent",
  caption?: string,
) {
  // 1. Upload to public bucket 'voice_notes'
  const uploadRes = await uploadRecordedVoice(recording, "note", userId);
  const publicUrl = uploadRes.publicUrl || "";

  // 2. Persist to notes table
  const captionText = caption ? caption.trim() : "";
  if (noteLifetime === "temporary") {
    return await NoteService.createTemporaryNote(
      userId,
      captionText,
      "voice",
      publicUrl,
      recording.durationSeconds,
      recording.waveform,
    );
  } else {
    return await NoteService.createPermanentNote(
      userId,
      captionText,
      "voice",
      publicUrl,
      recording.durationSeconds,
      recording.waveform,
    );
  }
}
