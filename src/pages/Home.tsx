import { Map, Navigation } from "lucide-react";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";

export function Home() {
  return (
    <div className="flex h-full flex-col p-6 pb-28">
      <header className="mb-8 mt-2">
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-foreground">
          Discover
        </h1>
        <p className="text-muted-foreground mt-1">Explore what's happening around you.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-10">
        <PremiumEmptyState
          icon={Navigation}
          title="Map Discovery"
          description="The new map-based discovery experience is currently under construction. Check back soon for local events and creators near you."
          glowColor="primary"
          action={{
            label: "Explore Trending",
            onClick: () => (window.location.href = "/explore"),
          }}
        />
      </div>
    </div>
  );
}
