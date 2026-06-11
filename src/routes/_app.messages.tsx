import { createFileRoute } from "@tanstack/react-router";
import { Messages } from "@/screens/Messages";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — Matisa" }] }),
  component: Messages,
});
