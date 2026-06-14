import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Plus,
  Clock,
  CheckCircle2,
  Mic,
  Globe,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { useEvents, type Event } from "@/hooks/useEvents";
import { toast } from "sonner";
import { fmtCount } from "@/types";
import { RecommendationAI } from "@/services/ai";

type EventTab = "upcoming" | "mine";

// ─────────────────────────────────────────────
// TYPE BADGE
// ─────────────────────────────────────────────

function TypeBadge({ type }: { type: Event["event_type"] }) {
  const map = {
    in_person: {
      label: "In Person",
      icon: MapPin,
      colorClass: "text-primary bg-primary/20 border-primary/30",
    },
    karaoke: {
      label: "Karaoke",
      icon: Mic,
      colorClass: "text-accent1 bg-accent1/20 border-accent1/30",
    },
    virtual: {
      label: "Virtual",
      icon: Globe,
      colorClass: "text-accent4 bg-accent4/20 border-accent4/30",
    },
  };
  const { label, icon: Icon, colorClass } = map[type] ?? map["in_person"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border backdrop-blur-sm ${colorClass}`}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// EVENT CARD
// ─────────────────────────────────────────────

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[24px] border border-border bg-card group"
    >
      {/* Cover */}
      <div className="relative h-40 w-full bg-gradient-to-br from-primary/30 to-secondary/30">
        {event.cover_url && (
          <img
            src={event.cover_url}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Date chip — top left */}
        <div className="absolute left-3 top-3 rounded-xl px-2.5 py-1.5 text-center bg-background/80 backdrop-blur-md border border-border/50">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {dt.toLocaleDateString("en-NA", { month: "short" })}
          </div>
          <div className="text-xl font-bold leading-none text-foreground">{dt.getDate()}</div>
        </div>

        {/* Type badge — top right */}
        <div className="absolute right-3 top-3">
          <TypeBadge type={event.event_type} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight">
          {event.title}
        </h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
            <Clock size={14} className="text-primary" />
            <span>
              {dateStr} · {timeStr}
            </span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
              <MapPin size={14} className="text-accent3" />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
          {event.communities?.name && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium">
              <Users size={14} className="text-accent1" />
              <span>{event.communities.name}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-4 text-[13px] leading-relaxed text-foreground/80 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium bg-background px-3 py-1.5 rounded-full border border-border">
            <Users size={13} />
            <span>{fmtCount(0)} going</span>
          </div>

          <button
            onClick={handleRsvp}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition active:scale-95 shadow-lg ${
              rsvpd
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {rsvpd && <CheckCircle2 size={16} />}
            {rsvpd ? "Going" : "RSVP"}
          </button>
        </div>

        {/* Host */}
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground bg-gradient-to-tr from-primary to-secondary shadow-md">
            {(event.profiles?.full_name || event.profiles?.username || "?")[0].toUpperCase()}
          </div>
          <span className="text-xs text-muted-foreground">
            Hosted by{" "}
            <span className="font-bold text-foreground">
              {event.profiles?.full_name || event.profiles?.username}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// EVENTS PAGE
// ─────────────────────────────────────────────

export function Events() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<EventTab>("upcoming");
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [recommendedEventIds, setRecommendedEventIds] = useState<string[]>([]);

  const { events, isLoading, createEvent } = useEvents();

  useEffect(() => {
    if (profile && tab === "upcoming") {
      RecommendationAI.getRecommendedEvents(profile.id)
        .then((ids) => {
          if (ids) setRecommendedEventIds(ids);
        })
        .catch(console.error);
    }
  }, [profile, tab]);

  const myEvents = events.filter((e) => e.created_by === profile?.id);

  const filtered = (tab === "mine" ? myEvents : events).filter(
    (e) => !query || e.title.toLowerCase().includes(query.toLowerCase()),
  );

  const topPicks =
    tab === "upcoming" ? filtered.filter((e) => recommendedEventIds.includes(e.id)) : [];
  const otherEvents =
    tab === "upcoming" ? filtered.filter((e) => !recommendedEventIds.includes(e.id)) : filtered;

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
    <div className="pb-28 min-h-full text-foreground relative">
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="sticky top-14 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3 focus-within:border-primary/50 transition-colors">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 mt-2">
          {(["upcoming", "mine"] as EventTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-4 text-sm font-bold transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground"}`}
            >
              {t === "upcoming" ? "Upcoming" : "My Events"}
              {tab === t && (
                <motion.span
                  layoutId="events-tab"
                  className="absolute bottom-0 left-[20%] right-[20%] h-1 rounded-t-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 relative z-10">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-[24px] bg-card animate-pulse border border-border"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="mt-8">
            <PremiumEmptyState
              icon={CalendarDays}
              title={tab === "mine" ? "No events created yet" : "No events near you"}
              description={
                tab === "mine"
                  ? "Host your first event and bring the community together."
                  : "There are no upcoming events matching your criteria right now."
              }
              glowColor="primary"
              action={
                <div className="space-y-3 w-full max-w-[280px]">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground bg-primary transition hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Create Event
                  </button>
                  {tab !== "mine" && (
                    <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-foreground bg-card border border-border transition hover:bg-accent">
                      <Search size={16} /> Discover Namibia Events
                    </button>
                  )}
                </div>
              }
            />
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-8">
              {topPicks.length > 0 && !query && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
                      Top Picks For You
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {topPicks.map((event) => (
                      <EventCard
                        key={`top-${event.id}`}
                        event={event}
                        currentUserId={profile?.id}
                        onRsvp={handleRsvp}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherEvents.length > 0 && (
                <div>
                  {topPicks.length > 0 && !query && (
                    <h2 className="text-lg font-bold mb-4 mt-8 text-muted-foreground">
                      More Events
                    </h2>
                  )}
                  <div className="grid grid-cols-1 gap-6">
                    {otherEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        currentUserId={profile?.id}
                        onRsvp={handleRsvp}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-primary/40 transition hover:scale-105 active:scale-95 z-30 bg-gradient-to-tr from-primary to-[#FF6B6B]"
        aria-label="Create event"
      >
        <Plus size={24} className="text-primary-foreground" strokeWidth={3} />
      </button>

      <CreateEventModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
