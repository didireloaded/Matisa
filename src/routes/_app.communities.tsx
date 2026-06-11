import { createFileRoute } from "@tanstack/react-router";
import { Communities } from "@/screens/Communities";

export const Route = createFileRoute("/_app/communities")({
  head: () => ({ meta: [{ title: "Communities — Matisa" }] }),
  component: Communities,
});
