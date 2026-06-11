import { createFileRoute } from "@tanstack/react-router";
import { RadarPage } from "@/screens/Radar";

export const Route = createFileRoute("/_app/radar")({
  head: () => ({ meta: [{ title: "Radar — Matisa" }] }),
  component: RadarPage,
});
