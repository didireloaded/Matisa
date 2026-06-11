import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/screens/Settings";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Matisa" }] }),
  component: Settings,
});
