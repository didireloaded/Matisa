import { createFileRoute } from "@tanstack/react-router";
import { CommunityDetail } from "@/screens/CommunityDetail";
import { ClientOnly } from "@/components/ClientOnly";
import { ScreenLoader } from "@/components/ScreenFallback";

export const Route = createFileRoute("/community/$id")({
  head: () => ({ meta: [{ title: "Community — Matisa" }] }),
  component: () => (
    <ClientOnly fallback={<ScreenLoader />}>
      <CommunityDetail />
    </ClientOnly>
  ),
});
