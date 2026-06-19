import { createContext, useContext, useState, ReactNode } from "react";

interface VoiceContextType {
  activeRoomId: string | null;
  activeRoomTitle: string | null;
  isMuted: boolean;
  joinRoom: (roomId: string, title: string) => void;
  leaveRoom: () => void;
  toggleMute: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomTitle, setActiveRoomTitle] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const joinRoom = (roomId: string, title: string) => {
    setActiveRoomId(roomId);
    setActiveRoomTitle(title);
    setIsMuted(false);
  };

  const leaveRoom = () => {
    setActiveRoomId(null);
    setActiveRoomTitle(null);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <VoiceContext.Provider
      value={{
        activeRoomId,
        activeRoomTitle,
        isMuted,
        joinRoom,
        leaveRoom,
        toggleMute,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
}
