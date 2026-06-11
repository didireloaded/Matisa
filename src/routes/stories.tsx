import { createFileRoute } from "@tanstack/react-router";
import { Stories } from "@/screens/Stories";
import { ClientOnly } from "@/components/ClientOnly";
import { ScreenLoader } from "@/components/ScreenFallback";

export const Route = createFileRoute("/stories")({
  validateSearch: (search: Record<string, unknown>) => ({
    idx: typeof search.idx === "string" ? search.idx : undefined,
  }),
  head: () => ({ meta: [{ title: "Stories — Matisa" }] }),
  component: () => (
    <ClientOnly fallback={<ScreenLoader />}>
      <Stories />
    </ClientOnly>
  ),
});
