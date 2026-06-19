import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Events() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, profiles!events_creator_id_fkey(*)") // creator details
          .order("start_time", { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleRSVP = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) return toast.error("Please sign in to RSVP");
    try {
      const { error } = await supabase
        .from("event_attendees")
        .insert({ event_id: eventId, user_id: profile.id, status: "going" });
      if (error) {
        if (error.code === "23505") toast.success("You are already going!");
        else throw error;
      } else {
        toast.success("RSVP successful!");
      }
    } catch (err) {
      toast.error("Failed to RSVP");
    }
  };

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
            {events.slice(0, 3).map((event) => (
              <motion.div
                key={`feat_${event.id}`}
                whileTap={{ scale: 0.98 }}
                className="relative min-w-[280px] h-[320px] rounded-[24px] overflow-hidden shrink-0 group cursor-pointer"
                onClick={() => {}}
              >
                <img
                  src={
                    event.cover_image ||
                    "https://images.unsplash.com/photo-1540039155732-d674d6e3f670?q=80&w=1000&auto=format&fit=crop"
                  }
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-white text-xs font-bold">
                      {new Date(event.start_time).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl mb-1 leading-tight">{event.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-xs font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {event.location_name || event.location_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">
                      {event.is_paid ? "Paid" : "Free"}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 font-bold px-4"
                      onClick={(e) => handleRSVP(event.id, e)}
                    >
                      RSVP
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
            {events.slice(3).map((event) => (
              <Card
                key={`list_${event.id}`}
                variant="outline"
                className="flex gap-4 p-3 pr-4 overflow-hidden group cursor-pointer hover:bg-[var(--color-surface-3)] transition"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={
                      event.cover_image ||
                      "https://images.unsplash.com/photo-1540039155732-d674d6e3f670?q=80&w=1000&auto=format&fit=crop"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight truncate mb-1">
                      {event.title}
                    </h3>
                    <p className="text-[var(--color-primary)] text-xs font-bold mb-1">
                      {new Date(event.start_time).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-[11px] truncate flex items-center gap-1">
                      <MapPin size={10} /> {event.location_name || event.location_type}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-bold text-sm">
                      {event.is_paid ? "Paid" : "Free"}
                    </span>
                    <Button
                      variant="glass"
                      size="sm"
                      className="h-7 px-3 text-[10px]"
                      onClick={(e) => handleRSVP(event.id, e)}
                    >
                      RSVP
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
