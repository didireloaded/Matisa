import { createFileRoute } from "@tanstack/react-router";
import { Explore } from "@/screens/Explore";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "Explore — Matisa" }] }),
  component: Explore,
});
