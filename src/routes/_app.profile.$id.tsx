import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/screens/Profile";

export const Route = createFileRoute("/_app/profile/$id")({
  head: () => ({ meta: [{ title: "Profile — Matisa" }] }),
  component: Profile,
});
