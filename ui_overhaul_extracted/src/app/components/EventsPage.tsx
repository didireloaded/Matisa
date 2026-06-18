import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, MapPin, Users, Clock, Tag } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { EVENTS, USERS } from "./data";

const CATEGORIES = ["All", "Music", "Fashion", "Festival", "Open Mic"];

function getUserByUsername(username: string) {
  return USERS.find((u) => u.username === username) || USERS[0];
}

export function EventsPage() {
  const [cat, setCat] = useState("All");
  const [goingMap, setGoingMap] = useState<Record<string, boolean>>(
    Object.fromEntries(EVENTS.map((e) => [e.id, e.going])),
  );

  const filtered = cat === "All" ? EVENTS : EVENTS.filter((e) => e.category === cat);

  return (
    <div className="min-h-full pb-28">
      <div className="px-4 pt-4 pb-2">
        <h1
          className="text-white font-display text-2xl mb-1"
          style={{ fontFamily: "Syne, sans-serif", fontWeight: 800 }}
        >
          Events
        </h1>
        <p className="text-white/40 text-sm">What's happening in Namibia</p>
      </div>

      {/* Category pills */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.93 }}
              onClick={() => setCat(c)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition"
              style={{
                background: cat === c ? "#FF9D2E" : "#151515",
                color: cat === c ? "#0B0B0B" : "rgba(255,255,255,0.6)",
                border: cat === c ? "none" : "1px solid rgba(255,255,255,0.06)",
                fontWeight: cat === c ? 700 : 400,
              }}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {filtered.map((event, i) => {
          const going = goingMap[event.id];
          const organizer = getUserByUsername(event.organizer);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#151515] rounded-[20px] overflow-hidden border border-white/5"
            >
              <div className="relative h-44">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgba(255,157,46,0.2)",
                      color: "#FF9D2E",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {event.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {event.price}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-white text-base mb-1" style={{ fontWeight: 700 }}>
                  {event.title}
                </h2>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={organizer.avatar}
                      alt={organizer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white/50 text-xs">by @{event.organizer}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <CalendarDays size={13} className="text-[#FF9D2E]" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Clock size={13} className="text-[#FF9D2E]" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs col-span-2">
                    <MapPin size={13} className="text-[#FF9D2E]" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Users size={13} className="text-[#A855F7]" />
                    {event.attendees} going
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGoingMap((m) => ({ ...m, [event.id]: !going }))}
                  className="w-full py-2.5 rounded-2xl text-sm transition"
                  style={{
                    background: going
                      ? "rgba(168,85,247,0.15)"
                      : "linear-gradient(135deg, #FF9D2E, #FF6B35)",
                    color: going ? "#A855F7" : "#0B0B0B",
                    fontWeight: 700,
                    border: going ? "1px solid rgba(168,85,247,0.3)" : "none",
                  }}
                >
                  {going ? "✓ Going" : "I'm Going"}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
