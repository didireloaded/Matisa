// src/pages/Chat.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Video, PhoneCall, Plus, Mic, Send, Play, Pause } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { USERS } from "@/data/dummy";
import { toast } from "sonner";
import { VoiceNoteRecorderModal } from "@/components/voice/VoiceNoteRecorderModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useRecordedVoicePlayback, getSignedVoiceUrl } from "@/features/recorded-voice";
import { VoiceWaveform } from "@/components/ui/VoiceWaveform";

export function Chat() {
  const { conversationId, id } = useParams<{ conversationId?: string; id?: string }>();
  const targetId = conversationId || id || "conv-1";
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const activeUserId = session?.user?.id || profile?.id || "demo-user-123";

  const matchedUser = USERS.find((u) => u.id === targetId || u.username === targetId) || USERS[0];

  const { messages: realtimeMessages, sendMessage } = useMessages(targetId);
  const playback = useRecordedVoicePlayback();

  const [inputText, setInputText] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  // Local fallback messages list for mock/offline testing
  const [localMessages, setLocalMessages] = useState<any[]>([
    {
      id: "m-1",
      sender_id: matchedUser.id,
      content: `Hi 😁 I'm ${matchedUser.name}.`,
      media_type: "text",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "m-2",
      sender_id: matchedUser.id,
      content: "It seems we have a lot in common and share similar interests in voice content! 🎙️",
      media_type: "text",
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "m-3",
      sender_id: matchedUser.id,
      content: null,
      media_type: "voice",
      media_path: null,
      media_url: "dummy_voice_recording.webm",
      duration_seconds: 24,
      waveform_data: [20, 45, 60, 80, 50, 30, 75, 90, 40, 25, 65, 85, 30, 20],
      created_at: new Date(Date.now() - 900000).toISOString(),
    },
  ]);

  const displayMessages = realtimeMessages.length > 0 ? realtimeMessages : localMessages;

  // Resolve private signed URLs for voice messages that have a storage path
  useEffect(() => {
    async function resolveSignedUrls() {
      const updates: Record<string, string> = {};
      for (const msg of displayMessages) {
        if (msg.media_type === "voice" && msg.media_path && !signedUrls[msg.id]) {
          const signed = await getSignedVoiceUrl("voice_messages", msg.media_path);
          if (signed) {
            updates[msg.id] = signed;
          }
        }
      }
      if (Object.keys(updates).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...updates }));
      }
    }
    resolveSignedUrls();
  }, [displayMessages, signedUrls]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");

    try {
      await sendMessage(text);
    } catch {
      // Local fallback append
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender_id: activeUserId,
          content: text,
          media_type: "text",
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleVoiceMessagePublished = (pathOrUrl: string) => {
    // Append to local state if realtime is not active
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `voice-msg-${Date.now()}`,
        sender_id: activeUserId,
        content: null,
        media_type: "voice",
        media_path: pathOrUrl.startsWith("http") ? null : pathOrUrl,
        media_url: pathOrUrl.startsWith("http") ? pathOrUrl : null,
        duration_seconds: 12,
        waveform_data: [30, 55, 80, 40, 65, 90, 50, 35, 70, 85, 30, 25],
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#030712] text-white relative overflow-hidden">
      {/* 1. Header */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-10 pb-4 glass-header border-b border-white/10">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95 shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            <Avatar
              size={40}
              profile={{
                id: matchedUser.id,
                display_name: matchedUser.name,
                avatar_url: matchedUser.avatar,
              }}
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#35C67A] border-2 border-[#030712]" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white leading-tight truncate">
              {matchedUser.name}
            </h1>
            <span className="text-[11px] text-[#35C67A] font-semibold block truncate">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toast.info(`Starting video call with ${matchedUser.name}...`)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95"
            aria-label="Video Call"
          >
            <Video size={17} />
          </button>
          <button
            onClick={() => toast.info(`Calling ${matchedUser.name}...`)}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95"
            aria-label="Phone Call"
          >
            <PhoneCall size={17} />
          </button>
        </div>
      </div>

      {/* 2. Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
        {displayMessages.map((m) => {
          const isMe = m.sender_id === activeUserId || m.sender === "me";
          const audioUrlToPlay = signedUrls[m.id] || m.media_url || "dummy_voice_recording.webm";
          const isPlayingThis = playback.activeId === m.id && playback.isPlaying;
          const durationSecs = m.duration_seconds || 15;

          if (!isMe) {
            return (
              <div key={m.id} className="flex items-start gap-3">
                <Avatar
                  size={36}
                  profile={{
                    id: m.sender_id,
                    display_name: matchedUser.name,
                    avatar_url: matchedUser.avatar,
                  }}
                />
                {m.media_type === "voice" ? (
                  /* Audio Bubble for Incoming Voice Message */
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-[22px] glass-panel-elevated border border-white/15 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (isPlayingThis) {
                            playback.pause();
                          } else {
                            playback.play(m.id, audioUrlToPlay, durationSecs);
                          }
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#39B7F2] text-white shadow-md active:scale-90 transition"
                      >
                        {isPlayingThis ? (
                          <Pause size={16} fill="white" />
                        ) : (
                          <Play size={16} fill="white" className="ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <VoiceWaveform
                          waveform={m.waveform_data || [20, 40, 60, 80, 50, 30, 70, 90]}
                          progress={
                            isPlayingThis
                              ? (playback.currentTime / (playback.duration || 1)) * 100
                              : 0
                          }
                          height={28}
                          activeColor="#39B7F2"
                          inactiveColor="rgba(57, 183, 242, 0.2)"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/50 px-1 font-mono">
                      <span>{formatTime(isPlayingThis ? playback.currentTime : durationSecs)}</span>
                      {isPlayingThis && (
                        <div className="flex items-center gap-1 text-[#39B7F2]">
                          <button
                            onClick={() =>
                              playback.setRate(
                                playback.playbackRate === 1
                                  ? 1.5
                                  : playback.playbackRate === 1.5
                                    ? 2
                                    : 1,
                              )
                            }
                            className="font-bold text-[10px] px-1 rounded bg-white/10"
                          >
                            {playback.playbackRate}x
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-[22px] glass-panel text-xs text-white max-w-[260px] leading-relaxed">
                    {m.content || m.text}
                  </div>
                )}
              </div>
            );
          }

          /* Sent Message / Audio Bubble */
          return (
            <div key={m.id} className="flex justify-end">
              {m.media_type === "voice" ? (
                <div className="flex flex-col gap-1.5 p-3.5 rounded-[22px] bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white max-w-[280px] shadow-lg">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (isPlayingThis) {
                          playback.pause();
                        } else {
                          playback.play(m.id, audioUrlToPlay, durationSecs);
                        }
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#24A3C7] shadow-md active:scale-90 transition"
                    >
                      {isPlayingThis ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <VoiceWaveform
                        waveform={m.waveform_data || [30, 50, 70, 90, 60, 40, 80]}
                        progress={
                          isPlayingThis
                            ? (playback.currentTime / (playback.duration || 1)) * 100
                            : 0
                        }
                        height={28}
                        activeColor="#FFFFFF"
                        inactiveColor="rgba(255, 255, 255, 0.3)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/80 px-1 font-mono">
                    <span>{formatTime(isPlayingThis ? playback.currentTime : durationSecs)}</span>
                    {isPlayingThis && (
                      <button
                        onClick={() =>
                          playback.setRate(
                            playback.playbackRate === 1
                              ? 1.5
                              : playback.playbackRate === 1.5
                                ? 2
                                : 1,
                          )
                        }
                        className="font-bold text-[10px] px-1 rounded bg-black/20"
                      >
                        {playback.playbackRate}x
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-[22px] bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-xs font-semibold text-white max-w-[260px] shadow-lg">
                  {m.content || m.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Input Bar */}
      <div className="p-4 pb-safe glass-header">
        <div className="flex items-center gap-2 rounded-full glass-panel-elevated p-2 border border-white/20">
          <button
            onClick={() => toast.info("Attach image or media file")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/10"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type Message.."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
          />

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:text-white transition"
            aria-label="Voice Message"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={handleSend}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24A3C7] text-white shadow-md active:scale-90 transition"
            aria-label="Send"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>

      {isVoiceModalOpen && (
        <VoiceNoteRecorderModal
          open={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onPublished={handleVoiceMessagePublished}
          mode="message"
          conversationId={targetId}
        />
      )}
    </div>
  );
}

export default Chat;
