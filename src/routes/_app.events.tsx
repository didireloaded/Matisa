import { createFileRoute } from "@tanstack/react-router";
import { Events } from "@/screens/Events";

export const Route = createFileRoute("/_app/events")({
  head: () => ({ meta: [{ title: "Events — Matisa" }] }),
  component: Events,
});
