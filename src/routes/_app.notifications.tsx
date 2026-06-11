import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/screens/Notifications";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Matisa" }] }),
  component: Notifications,
});
