import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/screens/Home";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Matisa — See who's around you" },
      {
        name: "description",
        content:
          "Matisa is a location-based social discovery app for Namibia. See who's nearby, what events are happening and what communities are active right now.",
      },
    ],
  }),
  component: Home,
});
