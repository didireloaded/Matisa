import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Plus,
  Share2,
  Car,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { SkeletonList } from "@/components/common/SkeletonLoader";

const DUMMY_EVENTS = [
  {
    id: "evt-1",
    title: "Windhoek Summer Vocal Festival 2026",
    description: "Live outdoor music & karaoke competition featuring top Namibian artists and live voice stages.",
    event_type: "in_person",
    location_name: "Independence Stadium, Windhoek",
    start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    price: 150,
    is_paid: true,
    cover_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    attendees_count: 340,
    carpool_available: true,
    is_saved: true,
  },
  {
    id: "evt-2",
    title: "Namibian Acoustic Voice Session",
    description: "Intimate live virtual voice room and acoustic performance stream broadcasting live on Matisa.",
    event_type: "virtual",
    location_name: "Matisa Voice Room #1",
    start_time: new Date(Date.now() + 86400000 * 5).toISOString(),
    price: 0,
    is_paid: false,
    cover_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    attendees_count: 185,
    carpool_available: false,
    is_saved: false,
  },
  {
    id: "evt-3",
    title: "Katutura Night Market & Live Karaoke",
    description: "Traditional kapana food stalls, local crafts, and open-mic karaoke stage under the stars.",
    event_type: "in_person",
    location_name: "Katutura Central, Windhoek",
    start_time: new Date(Date.now() + 86400000 * 7).toISOString(),
    price: 0,
    is_paid: false,
    cover_url:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    attendees_count: 290,
    carpool_available: true,
    is_saved: true,
  },
  {
    id: "evt-4",
    title: "Swakopmund Sunset Sound Clash",
    description: "Coastal electronic music festival & beach voice lounge with live DJ sets.",
    event_type: "in_person",
    location_name: "Mole Beach, Swakopmund",
    start_time: new Date(Date.now() + 86400000 * 12).toISOString(),
    price: 200,
    is_paid: true,
    cover_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    attendees_count: 412,
    carpool_available: true,
    is_saved: false,
  },
  {
    id: "evt-5",
    title: "UNAM Tech & Creator Meetup",
    description: "Connect with Namibian app developers, vocalists, and digital storytellers.",
    event_type: "in_person",
    location_name: "UNAM Main Campus Auditorium",
    start_time: new Date(Date.now() + 86400000 * 15).toISOString(),
    price: 0,
    is_paid: false,
    cover_url:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80",
    attendees_count: 95,
    carpool_available: true,
    is_saved: false,
  },
];

export function Events() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [rsvpState, setRsvpState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, profiles!events_created_by_fkey(*)")
          .order("start_time", { ascending: true });
        if (!error && data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(DUMMY_EVENTS);
        }
      } catch (err) {
        setEvents(DUMMY_EVENTS);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const displayEvents = events.filter((e) => {
    if (activeTab === "virtual") return e.event_type === "virtual";
    if (activeTab === "in_person") return e.event_type === "in_person";
    if (activeTab === "saved") return e.is_saved;
    return true;
  });

  const handleRSVP = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRsvpState((prev) => {
      const nextState = !prev[eventId];
      toast.success(
        nextState ? "RSVP confirmed! Added to your calendar." : "RSVP canceled.",
      );
      return { ...prev, [eventId]: nextState };
    });
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#000000] text-white pb-28">
      {/* Top Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Events & Gatherings</h1>
          <p className="text-xs text-white/40">Physical & Paid Virtual Events in Namibia</p>
        </div>
        <button
          onClick={() => toast.info("Create Event feature opening...")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] text-black text-xs font-bold shadow-md active:scale-95 transition"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Host Event</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "All Events" },
          { id: "in_person", label: "Physical" },
          { id: "virtual", label: "Live Virtual" },
          { id: "saved", label: "Saved" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              activeTab === tab.id
                ? "bg-white text-black font-bold shadow-md"
                : "bg-white/[0.05] text-white/60 border border-white/[0.06] hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-6 flex-1 mt-1">
        {loading ? (
          <SkeletonList />
        ) : displayEvents.length === 0 ? (
          <PremiumEmptyState
            icon={Calendar}
            title="No Events Found"
            description="No upcoming events found for this filter tab."
            glowColor="accent1"
            action={{
              label: "Show All Events",
              onClick: () => setActiveTab("all"),
            }}
          />
        ) : (
          <>
            {/* Featured Events Banner */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  Featured Highlights
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                {displayEvents.slice(0, 2).map((event) => (
                  <motion.div
                    key={`feat_${event.id}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="relative min-w-[300px] h-[320px] rounded-[24px] overflow-hidden shrink-0 group cursor-pointer border border-white/[0.08] bg-[#111111]"
                  >
                    <img
                      src={event.cover_url || event.cover_image}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                        {event.event_type === "virtual" ? (
                          <>
                            <Radio size={10} className="text-purple-400 animate-pulse" />
                            <span className="text-purple-300">LIVE VIRTUAL</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={10} className="text-[#00D9C0]" />
                            <span>IN-PERSON</span>
                          </>
                        )}
                      </span>
                      {event.carpool_available && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                          <Car size={10} /> Carpool
                        </span>
                      )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <span className="text-[10px] font-bold text-[#00D9C0] tracking-wider uppercase">
                        {new Date(event.start_time).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-xs text-white/50 truncate flex items-center gap-1">
                        <MapPin size={12} className="text-white/40 shrink-0" />
                        <span>{event.location_name}</span>
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <img
                              className="inline-block h-5 w-5 rounded-full ring-1 ring-black"
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop"
                              alt=""
                            />
                            <img
                              className="inline-block h-5 w-5 rounded-full ring-1 ring-black"
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop"
                              alt=""
                            />
                          </div>
                          <span className="text-[10px] text-white/60 font-semibold">
                            +{event.attendees_count} going
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleRSVP(event.id, e)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                            rsvpState[event.id]
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                              : "bg-white text-black"
                          }`}
                        >
                          {rsvpState[event.id] ? (
                            <>
                              <CheckCircle2 size={12} /> Going
                            </>
                          ) : (
                            "RSVP"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Upcoming Events Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block">
                Upcoming Events ({displayEvents.length})
              </span>

              {displayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="w-full bg-[#111111] rounded-[24px] border border-white/[0.08] p-3.5 flex gap-3.5 items-center hover:border-white/20 transition cursor-pointer active:scale-[0.99]"
                >
                  <img
                    src={event.cover_url || event.cover_image}
                    alt={event.title}
                    className="w-24 h-24 rounded-[18px] object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#00D9C0] uppercase tracking-wider">
                        {new Date(event.start_time).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs font-bold text-white/80">
                        {event.is_paid ? `N$ ${event.price}` : "Free"}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-sm leading-snug truncate">
                      {event.title}
                    </h3>

                    <p className="text-xs text-white/40 truncate flex items-center gap-1">
                      <MapPin size={11} className="shrink-0" />
                      <span>{event.location_name}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-white/50">
                        <Users size={12} />
                        <span>{event.attendees_count} going</span>
                      </div>

                      <button
                        onClick={(e) => handleRSVP(event.id, e)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                          rsvpState[event.id]
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        {rsvpState[event.id] ? "Going" : "RSVP"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Events;
