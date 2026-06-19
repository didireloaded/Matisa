import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  Star,
  Heart,
  Share2,
  Plus,
  Clock,
  Compass,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";

const DUMMY_EVENTS = [
  {
    id: "evt_1",
    title: "Neon Nights Festival",
    date: "Aug 15 • 9:00 PM",
    location: "Downtown Arena",
    image:
      "https://images.unsplash.com/photo-1540039155732-d674d6e3f670?q=80&w=1000&auto=format&fit=crop",
    price: "$45.00",
    attendees: 1240,
    tags: ["Music", "Festival", "Electronic"],
    isHot: true,
  },
  {
    id: "evt_2",
    title: "Acoustic Sunset Sessions",
    date: "Aug 18 • 6:00 PM",
    location: "Rooftop Garden",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    price: "$20.00",
    attendees: 156,
    tags: ["Live Music", "Acoustic", "Chill"],
  },
  {
    id: "evt_3",
    title: "Creator Masterclass: Audio Production",
    date: "Aug 22 • 2:00 PM",
    location: "Studio 54 / Virtual",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    price: "Free",
    attendees: 380,
    tags: ["Workshop", "Education", "Production"],
    isHot: true,
  },
];

export function Events() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Events</h1>
      </div>

      <div className="px-5 mb-6">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "upcoming", label: "Upcoming" },
            { id: "trending", label: "Trending" },
            { id: "saved", label: "Saved" },
          ]}
        />
      </div>

      <div className="flex-1 px-5 space-y-6">
        {/* Featured Carousel */}
        <div>
          <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Featured
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            {DUMMY_EVENTS.map((event) => (
              <motion.div
                key={`feat_${event.id}`}
                whileTap={{ scale: 0.98 }}
                className="relative min-w-[280px] h-[320px] rounded-[24px] overflow-hidden shrink-0 group cursor-pointer"
                onClick={() => {}}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-white text-xs font-bold">{event.date}</span>
                  </div>
                  {event.isHot && (
                    <div className="bg-[#FF416C]/20 text-[#FF416C] px-3 py-1.5 rounded-full border border-[#FF416C]/30 flex items-center gap-1 backdrop-blur-md">
                      <Flame size={12} />
                      <span className="text-xs font-bold uppercase tracking-wider">Hot</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-1 leading-tight">{event.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-xs font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {event.attendees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">{event.price}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 font-bold px-4"
                    >
                      Get Tickets
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* List View */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Discover More
            </h2>
          </div>

          <div className="space-y-4">
            {DUMMY_EVENTS.map((event, i) => (
              <Card
                key={`list_${event.id}`}
                variant="outline"
                className="flex gap-4 p-3 pr-4 overflow-hidden group cursor-pointer hover:bg-[var(--color-surface-3)] transition"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight truncate mb-1">
                      {event.title}
                    </h3>
                    <p className="text-[var(--color-primary)] text-xs font-bold mb-1">
                      {event.date}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-[11px] truncate flex items-center gap-1">
                      <MapPin size={10} /> {event.location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-bold text-sm">{event.price}</span>
                    <Button variant="glass" size="sm" className="h-7 px-3 text-[10px]">
                      Info
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events;
