import { createFileRoute } from "@tanstack/react-router";
import { KaraokeRoom } from "@/screens/KaraokeRoom";

export const Route = createFileRoute("/room/$id")({
  component: KaraokeRoom,
});
