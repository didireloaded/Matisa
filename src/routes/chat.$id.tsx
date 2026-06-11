import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/screens/Chat";
import { ClientOnly } from "@/components/ClientOnly";
import { ScreenLoader } from "@/components/ScreenFallback";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({ meta: [{ title: "Chat — Matisa" }] }),
  component: () => (
    <ClientOnly fallback={<ScreenLoader />}>
      <Chat />
    </ClientOnly>
  ),
});
