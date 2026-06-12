import { createFileRoute } from "@tanstack/react-router";
import { CommunityDetail } from "@/screens/CommunityDetail";

export const Route = createFileRoute("/_app/community/$id")({
  component: CommunityDetail,
});
