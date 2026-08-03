import { useState, useEffect } from "react";
import { Search, Radio, Calendar, Users, ChevronRight, UserPlus, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function Discovery() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "voice" | "rooms" | "events" | "people"
  >("all");

  const [people, setPeople] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscoveryData() {
      setLoading(true);
      try {
        // 1. Fetch real profiles from DB
        const { data: dbProfiles } = await supabase.from("profiles").select("*").limit(10);

        if (dbProfiles && dbProfiles.length > 0) {
          setPeople(
            dbProfiles.map((p) => ({
              id: p.id,
              name: p.display_name || p.username || "Creator",
              username: p.username || "creator",
              avatar: p.avatar_url,
              location: p.location || "Windhoek, Namibia",
            })),
          );
        } else {
          setPeople([
            {
              id: "usr-1",
              name: "Hanna Dowie",
              username: "hanna_d",
              avatar:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
              location: "Windhoek, Namibia",
            },
            {
              id: "usr-2",
              name: "Lukas Shilongo",
              username: "lukas_vibe",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              location: "Swakopmund, Namibia",
            },
            {
              id: "usr-3",
              name: "Michelle V.",
              username: "michelle_voice",
              avatar:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
              location: "Walvis Bay, Namibia",
            },
          ]);
        }

        // 2. Fetch real live rooms from DB
        const { data: dbRooms } = await supabase
          .from("voice_rooms")
          .select("*, profiles(*)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (dbRooms && dbRooms.length > 0) {
          setRooms(
            dbRooms.map((r) => ({
              id: r.id,
              title: r.title,
              host: r.profiles?.display_name || "Host",
              avatar: r.profiles?.avatar_url,
              listeners: r.max_speakers || 12,
              type: r.room_type || "voice",
            })),
          );
        } else {
          setRooms([
            {
              id: "room-1",
              title: "Windhoek Acoustic Lounge & Chill",
              host: "Lukas Shilongo",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              listeners: 34,
              type: "voice",
            },
            {
              id: "room-2",
              title: "Swakopmund Karaoke Stage 🎤",
              host: "Michelle V.",
              avatar:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
              listeners: 68,
              type: "karaoke",
            },
          ]);
        }

        // 3. Fetch real events from DB
        const { data: dbEvents } = await supabase
          .from("events")
          .select("*")
          .order("start_time", { ascending: true })
          .limit(5);

        if (dbEvents && dbEvents.length > 0) {
          setEvents(
            dbEvents.map((e) => ({
              id: e.id,
              title: e.title,
              location: e.location_name || "Windhoek",
              date: new Date(e.start_time).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
              attendees: e.attendees_count || 45,
            })),
          );
        } else {
          setEvents([
            {
              id: "event-1",
              title: "Windhoek Summer Vocal Festival 2026",
              location: "Independence Stadium, Windhoek",
              date: "Fri, 8 Aug • 19:00",
              attendees: 340,
            },
            {
              id: "event-2",
              title: "Swakop Sunset Acoustic Sessions",
              location: "Swakopmund Jetty",
              date: "Sat, 9 Aug • 17:30",
              attendees: 89,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load discovery data", err);
      } finally {
        setLoading(false);
      }
    }

    loadDiscoveryData();
  }, []);

  const filteredPeople = people.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.location?.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.host.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.location.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2 space-y-5">
      {/* 1. Header & Permanent Search Bar */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-display">Explore</h1>
            <p className="text-xs text-white/50">Discover Namibian voices, people & live rooms</p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <MapPin size={13} className="text-purple-400" />
            <span>Windhoek</span>
          </div>
        </div>

        {/* Permanent Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Namibian creators, notes, rooms & events..."
            className="w-full h-11 pl-11 pr-4 rounded-full glass-panel text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#6139F2] transition border border-white/15"
          />
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="px-5 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-gradient-to-r from-[#6139F2] to-[#24A3C7] text-white shadow-md"
              : "glass-panel text-white/60 hover:text-white"
          }`}
        >
          All Explore
        </button>

        <button
          onClick={() => setActiveCategory("people")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
            activeCategory === "people"
              ? "bg-[#6139F2] text-white shadow-md"
              : "glass-panel text-white/60 hover:text-white"
          }`}
        >
          People Nearby
        </button>

        <button
          onClick={() => setActiveCategory("rooms")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeCategory === "rooms"
              ? "bg-[#24A3C7] text-white shadow-md"
              : "glass-panel text-white/60 hover:text-white"
          }`}
        >
          <Radio size={13} />
          <span>Live Rooms</span>
        </button>

        <button
          onClick={() => setActiveCategory("events")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeCategory === "events"
              ? "bg-[#FF9D2E] text-white shadow-md"
              : "glass-panel text-white/60 hover:text-white"
          }`}
        >
          <Calendar size={13} />
          <span>Events</span>
        </button>
      </div>

      {/* 3. Live Voice Rooms Section */}
      {(activeCategory === "all" || activeCategory === "rooms") && (
        <div className="px-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-[#24A3C7] animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide">Live Rooms Now</h2>
            </div>
            <button
              onClick={() => navigate("/rooms")}
              className="text-xs font-bold text-[#24A3C7] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate("/rooms")}
                className="p-4 rounded-[22px] glass-panel-elevated border border-[#24A3C7]/30 hover:border-[#24A3C7]/60 transition cursor-pointer active:scale-[0.98] flex items-center justify-between bg-gradient-to-r from-[#06101D] to-[#0D1F38]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <Avatar
                      size={44}
                      profile={{ id: room.id, display_name: room.host, avatar_url: room.avatar }}
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#06101D]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{room.title}</h3>
                    <p className="text-xs text-white/60">
                      Hosted by @{room.host.toLowerCase().replace(/\s+/g, "_")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                  <Users size={13} className="text-[#24A3C7]" />
                  <span>{room.listeners} listening</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. People Nearby Section */}
      {(activeCategory === "all" || activeCategory === "people") && (
        <div className="px-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#6139F2]" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                People Nearby in Namibia
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredPeople.map((user) => (
              <div
                key={user.id}
                className="p-3.5 rounded-[20px] glass-panel border border-white/10 flex items-center justify-between hover:border-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size={42}
                    profile={{ id: user.id, display_name: user.name, avatar_url: user.avatar }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{user.name}</h3>
                    <p className="text-xs text-white/50">
                      @{user.username} • {user.location}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#24A3C7]/15 text-[#39B7F2] text-[10px] font-semibold border border-[#24A3C7]/30">
                        <Users size={10} />
                        {user.id === "usr-1"
                          ? "3 mutual friends"
                          : user.id === "usr-2"
                            ? "Both in Windhoek Creators"
                            : "Attending Swakop Sessions"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success(`Followed @${user.username}!`);
                    navigate(`/profile/${user.username}`);
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#6139F2] to-[#24A3C7] text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  <UserPlus size={13} />
                  <span>Follow</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Events Happening Soon */}
      {(activeCategory === "all" || activeCategory === "events") && (
        <div className="px-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#FF9D2E]" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Namibian Events This Week
              </h2>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="text-xs font-bold text-[#FF9D2E] hover:underline flex items-center gap-0.5"
            >
              <span>View events</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => navigate("/events")}
                className="p-4 rounded-[22px] glass-panel border border-[#FF9D2E]/30 hover:border-[#FF9D2E]/60 transition cursor-pointer active:scale-[0.98] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#FF9D2E] uppercase tracking-wider">
                    {evt.date}
                  </span>
                  <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <MapPin size={12} className="text-white/40" />
                    <span>{evt.location}</span>
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-[#FF9D2E]/20 text-[#FF9D2E] border border-[#FF9D2E]/40 text-xs font-bold">
                  RSVP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Discovery;
