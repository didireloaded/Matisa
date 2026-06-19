import { useState } from "react";
import { Search, MapPin, Music, Star, ArrowRight, Play, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/common/Avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/Tabs";

const DUMMY_CREATORS = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Vocalist",
    location: "Los Angeles",
    followers: "12K",
    image: "https://i.pravatar.cc/150?u=user_2",
  },
  {
    id: "2",
    name: "Marcus J.",
    role: "Producer",
    location: "New York",
    followers: "8.5K",
    image: "https://i.pravatar.cc/150?u=user_3",
  },
  {
    id: "3",
    name: "Elena R.",
    role: "Video Editor",
    location: "London",
    followers: "24K",
    image: "https://i.pravatar.cc/150?u=user_4",
  },
  {
    id: "4",
    name: "David Kim",
    role: "Guitarist",
    location: "Seoul",
    followers: "45K",
    image: "https://i.pravatar.cc/150?u=user_5",
  },
];

export function Creators() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Creators</h1>
      </div>

      <div className="px-5 mb-4">
        <Input
          placeholder="Find producers, singers..."
          icon={<Search size={18} />}
          className="h-12 rounded-full border-none bg-[var(--color-surface-2)]"
        />
      </div>

      <div className="px-5 mb-6">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "trending", label: "Trending" },
            { id: "new", label: "New Arrivals" },
            { id: "local", label: "Near You" },
          ]}
        />
      </div>

      <div className="flex-1 px-5 space-y-8">
        {/* Spotlight */}
        <div>
          <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Spotlight
          </h2>
          <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1516280440502-861f23fb0477?w=800&q=80"
              alt="Spotlight"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 bg-[#FF416C]/20 text-[#FF416C] px-3 py-1 rounded-full border border-[#FF416C]/30 flex items-center gap-1 backdrop-blur-md">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Creator of the Week
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h3 className="text-white font-bold text-2xl mb-1 leading-tight">
                  The Midnight Project
                </h3>
                <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                  <Music size={14} /> Electronic Duo
                </p>
              </div>
              <Button variant="primary" className="h-10 px-5 rounded-full font-bold">
                Become a Creator
              </Button>
            </div>
          </div>
        </div>

        {/* Creator Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Top Creators
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {DUMMY_CREATORS.map((creator) => (
              <Card
                key={creator.id}
                variant="outline"
                className="p-4 flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <Avatar
                    size={72}
                    profile={{
                      id: creator.id,
                      display_name: creator.name,
                      avatar_url: creator.image,
                    }}
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded-full text-[9px] font-bold text-[var(--color-text-muted)] flex items-center gap-0.5 whitespace-nowrap shadow-sm">
                    <Star size={8} className="text-[#F59E0B]" fill="currentColor" />{" "}
                    {creator.followers}
                  </div>
                </div>

                <h3 className="text-white font-bold text-sm truncate w-full mb-0.5">
                  {creator.name}
                </h3>
                <p className="text-[var(--color-primary)] text-xs font-bold truncate w-full mb-1">
                  {creator.role}
                </p>
                <p className="text-[var(--color-text-muted)] text-[10px] truncate w-full flex items-center justify-center gap-1">
                  <MapPin size={10} /> {creator.location}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Creators;
