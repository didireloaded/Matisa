import { useState } from "react";
import {
  Search,
  Radio,
  Calendar,
  Mic,
  Sparkles,
  MapPin,
  Users,
  ChevronRight,
  UserPlus,
  Music2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { USERS } from "@/data/dummy";
import { Avatar } from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import { toast } from "sonner";

export function Discovery() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "voice" | "rooms" | "events" | "people"
  >("all");

  const nearbyPeople = USERS.slice(0, 4);

  const liveRooms = [
    {
      id: "room-1",
      title: "Windhoek Acoustic Lounge & Chill",
      host: "Lukas Shilongo",
      avatar: USERS[1].avatar,
      listeners: 34,
      type: "voice",
    },
    {
      id: "room-2",
      title: "Swakopmund Karaoke Stage 🎤",
      host: "Michelle V.",
      avatar: USERS[2].avatar,
      listeners: 68,
      type: "karaoke",
    },
  ];

  const upcomingEvents = [
    {
      id: "event-1",
      title: "Namibian Creators Night",
      location: "Windhoek Central",
      date: "Fri, 8 Aug • 19:00",
      attendees: 142,
    },
    {
      id: "event-2",
      title: "Swakop Sunset Acoustic Sessions",
      location: "Swakopmund Jetty",
      date: "Sat, 9 Aug • 17:30",
      attendees: 89,
    },
  ];

  const filteredPeople = nearbyPeople.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.location?.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredRooms = liveRooms.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.host.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredEvents = upcomingEvents.filter(
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
                  </div>
                </div>

                <button
                  onClick={() => toast.success(`Followed @${user.username}!`)}
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
