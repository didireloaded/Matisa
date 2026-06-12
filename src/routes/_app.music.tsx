import { createFileRoute } from "@tanstack/react-router";
import { Music } from "@/screens/Music";

export const Route = createFileRoute("/_app/music")({
  component: Music,
});
