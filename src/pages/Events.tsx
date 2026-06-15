import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Users, Clock, Plus, Search, Radio, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { useEvents, type Event } from "@/hooks/useEvents";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";
import { RecommendationAI } from "@/services/ai";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "My Events", "Music", "Festival", "Open Mic"];
const GRADIENTS = [
  ["#2D3748", "#4A5568"],
  ["#4A5568", "#718096"],
  ["#718096", "#A0AEC0"],
  ["#A0AEC0", "#CBD5E0"],
  ["#E2E8F0", "#F7FAFC"],
];

function EventCard({
  event,
  currentUserId,
  onRsvp,
}: {
  event: Event;
  currentUserId?: string;
  onRsvp: (eventId: string, rsvpd: boolean) => void;
}) {
  const [rsvpd, setRsvpd] = useState(false);

  const handleRsvp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !rsvpd;
    setRsvpd(next);
    onRsvp(event.id, next);
  };

  const dt = new Date(event.start_time);
  const dateStr = dt.toLocaleDateString("en-NA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = dt.toLocaleTimeString("en-NA", { hour: "2-digit", minute: "2-digit" });

  const coverImage = event.cover_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80";

  const from = GRADIENTS[event.id.charCodeAt(0) % GRADIENTS.length][0];
  const to = GRADIENTS[event.id.charCodeAt(0) % GRADIENTS.length][1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] overflow-hidden border border-white/5"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="relative h-44">
        <ImageWithFallback
          src={coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: "rgba(45,55,70,0.3)", color: "#A0AEC0", backdropFilter: "blur(8px)" }}
          >
            {event.event_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-white text-base mb-1 font-bold">{event.title}</h2>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-primary to-secondary text-[8px] font-bold text-white">
            {event.profiles?.avatar_url ? (
               <ImageWithFallback src={event.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
               (event.profiles?.full_name || event.profiles?.username || "?")[0].toUpperCase()
            )}
          </div>
          <span className="text-white/50 text-xs">by @{event.profiles?.username || "user"}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <CalendarDays size={13} className="text-[#A0AEC0]" />
            {dateStr}
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Clock size={13} className="text-[#A0AEC0]" />
            {timeStr}
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs col-span-2">
            <MapPin size={13} className="text-[#A0AEC0]" />
            {event.location_name || "TBA"}
          </div>
          {event.communities?.name && (
            <div className="flex items-center gap-2 text-white/50 text-xs col-span-2">
              <Users size={13} className="text-[#A0AEC0]" />
              {event.communities.name}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRsvp}
          className="w-full py-2.5 rounded-2xl text-sm transition"
          style={{
                background: rsvpd
                  ? "rgba(45,55,70,0.15)"
                  : "linear-gradient(135deg, #2D3748, #4A5568)",
                color: rsvpd ? "#A0AEC0" : "#ffffff",
                fontWeight: 700,
                border: rsvpd ? "1px solid rgba(45,55,70,0.3)" : "none",
              }}
        >
          {rsvpd ? "✓ Going" : "I'm Going"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function VoiceRoomCard({ room, onClick }: { room: any, onClick: () => void }) {
  const from = GRADIENTS[room.id.charCodeAt(0) % GRADIENTS.length][0];
  const to = GRADIENTS[room.id.charCodeAt(0) % GRADIENTS.length][1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-[20px] border border-white/5 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#FF9D2E]/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex flex-col pr-4">
          <span className="text-white font-bold text-lg leading-tight">{room.title}</span>
          <span className="text-white/50 text-xs mt-1">Hosted by @{room.profiles?.username || "user"}</span>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
          <Radio size={12} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#0B0B0B] flex items-center justify-center">
               <Headphones size={10} className="text-white/60" />
             </div>
             <div className="w-6 h-6 rounded-full bg-[#2a2a2a] border border-[#0B0B0B]" />
          </div>
          <span className="text-white/60 text-xs ml-1">{room.participant_count} listening</span>
        </div>
        <button 
          onClick={onClick}
          className="px-5 py-2 rounded-full text-black text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #FF9D2E, #FF6B35)" }}
        >
          Join Room
        </button>
      </div>
    </motion.div>
  );
}

export function Events() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Tabs: "Events" | "Live Rooms"
  const [activeTab, setActiveTab] = useState<"Events" | "Live Rooms">("Events");
  
  // Events state
  const [cat, setCat] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendedEventIds, setRecommendedEventIds] = useState<string[]>([]);
  const { events, isLoading, createEvent } = useEvents();

  // Rooms state
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    if (profile && activeTab === "Events") {
      RecommendationAI.getRecommendedEvents(profile.id)
        .then((ids) => {
          if (ids) setRecommendedEventIds(ids);
        })
        .catch(console.error);
    }
  }, [profile, activeTab]);

  useEffect(() => {
    if (activeTab === "Live Rooms") {
      const fetchRooms = async () => {
        setLoadingRooms(true);
        const { data, error } = await supabase
          .from("voice_rooms")
          .select("*, profiles(*)")
          .eq("is_private", false)
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          setRooms(data);
        }
        setLoadingRooms(false);
      };
      
      fetchRooms();
      
      const channel = supabase
        .channel('public:voice_rooms')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => {
          fetchRooms();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTab]);

  const isMyEvents = cat === "My Events";
  const baseEvents = isMyEvents ? events.filter((e) => e.created_by === profile?.id) : events;
  
  const filteredEvents = baseEvents.filter(
    (e) => !query || e.title.toLowerCase().includes(query.toLowerCase()),
  );

  const topPicks =
    !isMyEvents ? filteredEvents.filter((e) => recommendedEventIds.includes(e.id)) : [];
  const otherEvents =
    !isMyEvents ? filteredEvents.filter((e) => !recommendedEventIds.includes(e.id)) : filteredEvents;

  const handleRsvp = async (eventId: string, rsvpd: boolean) => {
    if (!profile) return;
    if (rsvpd) {
      const { error } = await supabase
        .from("event_rsvps")
        .insert({ event_id: eventId, user_id: profile.id });
      if (error) toast.error("Failed to RSVP");
      else toast.success("You're going! 🎉");
    } else {
      await supabase.from("event_rsvps").delete().match({ event_id: eventId, user_id: profile.id });
      toast.success("RSVP removed");
    }
  };

  return (
    <div className="pb-28 min-h-full relative">
      <div className="px-4 pt-4 pb-2 sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <h1 className="text-white text-2xl mb-3 font-extrabold tracking-tight">Discover</h1>
        
        {/* Main Tab Switcher */}
        <div className="flex bg-[#1a1a1a] rounded-full p-1 mb-2">
          {(["Events", "Live Rooms"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-full text-sm font-bold transition relative"
              style={{
                color: activeTab === tab ? "#0B0B0B" : "rgba(255,255,255,0.5)",
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-[#FF9D2E] rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-2">
        {activeTab === "Events" ? (
          <>
            {/* Events Sub-navigation */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-4">
              {CATEGORIES.map((c) => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setCat(c)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition"
                  style={{
                    background: cat === c ? "rgba(255,157,46,0.15)" : "#151515",
                    color: cat === c ? "#FF9D2E" : "rgba(255,255,255,0.6)",
                    border: cat === c ? "1px solid rgba(255,157,46,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    fontWeight: cat === c ? 700 : 400,
                  }}
                >
                  {c}
                </motion.button>
              ))}
            </div>

            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events…"
                className="w-full bg-[#1a1a1a] text-white placeholder:text-white/30 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none border border-white/5 focus:border-[#FF9D2E]/30 transition"
              />
            </div>

            {isLoading ? (
              <div className="space-y-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="h-44 rounded-[20px] bg-white/5 animate-pulse border border-white/5" />
                 ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="mt-8">
                <PremiumEmptyState
                  icon={CalendarDays}
                  title={isMyEvents ? "No events created yet" : "No events near you"}
                  description={
                    isMyEvents
                      ? "Host your first event and bring the community together."
                      : "There are no upcoming events matching your criteria right now."
                  }
                  glowColor="primary"
                  action={
                    <div className="space-y-3 w-full max-w-[280px]">
                      <button
                        onClick={() => setShowCreate(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-black bg-[#FF9D2E] transition hover:bg-[#FF9D2E]/90 shadow-lg shadow-[#FF9D2E]/20"
                      >
                        <Plus size={18} strokeWidth={2.5} /> Create Event
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-4">
                  {topPicks.length > 0 && !query && (
                    <div>
                      <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#FF9D2E] mb-4">
                        Top Picks For You
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {topPicks.map((event) => (
                          <EventCard key={`top-${event.id}`} event={event} currentUserId={profile?.id} onRsvp={handleRsvp} />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherEvents.length > 0 && (
                    <div>
                      {topPicks.length > 0 && !query && (
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4 mt-8">
                          More Events
                        </h2>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {otherEvents.map((event) => (
                          <EventCard key={event.id} event={event} currentUserId={profile?.id} onRsvp={handleRsvp} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </>
        ) : (
          /* Live Rooms Tab */
          <div className="pt-2">
            {loadingRooms ? (
               <div className="space-y-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="h-32 rounded-[20px] bg-white/5 animate-pulse border border-white/5" />
                 ))}
               </div>
            ) : rooms.length === 0 ? (
               <PremiumEmptyState
                 icon={Radio}
                 title="No Active Rooms"
                 description="It's quiet right now. Start your own Live Audio Space and invite friends!"
                 glowColor="secondary"
               />
            ) : (
               <div className="grid grid-cols-1 gap-4">
                 {rooms.map((room) => (
                   <VoiceRoomCard 
                     key={room.id} 
                     room={room} 
                     onClick={() => navigate(`/room/${room.id}`)} 
                   />
                 ))}
               </div>
            )}
          </div>
        )}
      </div>

      {activeTab === "Events" && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-[#2D3748]/40 transition hover:scale-105 active:scale-95 z-30 bg-gradient-to-tr from-[#2D3748] to-[#4A5568]"
          aria-label="Create event"
        >
          <Plus size={24} className="text-black" strokeWidth={3} />
        </button>
      )}

      <CreateEventModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
