import { useState } from 'react';
import {
  CalendarDays, MapPin, Users, Plus, Clock,
  CheckCircle2, Mic, Globe, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/common';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { useEvents, type Event } from '@/hooks/useEvents';
import { toast } from 'sonner';
import { fmtCount } from '@/types';

type EventTab = 'upcoming' | 'mine';

// ─────────────────────────────────────────────
// TYPE BADGE
// ─────────────────────────────────────────────

function TypeBadge({ type }: { type: Event['event_type'] }) {
  const map = {
    in_person: { label: 'In Person', icon: MapPin,  color: '#C8521A' },
    karaoke:   { label: 'Karaoke',   icon: Mic,     color: '#2D7DD2' },
    virtual:   { label: 'Virtual',   icon: Globe,   color: '#4CAF7D' },
  };
  const { label, icon: Icon, color } = map[type] ?? map['in_person'];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: color + '20', color }}
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
  const dateStr = dt.toLocaleDateString('en-NA', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const timeStr = dt.toLocaleTimeString('en-NA', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border"
      style={{ background: '#1C1814', borderColor: '#2E2822' }}
    >
      {/* Cover */}
      <div
        className="relative h-36 w-full"
        style={{ background: 'linear-gradient(135deg,#C8521A,#6B2D1A)' }}
      >
        {event.cover_url && (
          <img src={event.cover_url} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Date chip — top left */}
        <div
          className="absolute left-3 top-3 rounded-xl px-2.5 py-1.5 text-center"
          style={{ background: 'rgba(15,13,11,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#E8A055]">
            {dt.toLocaleDateString('en-NA', { month: 'short' })}
          </div>
          <div className="text-xl font-bold leading-none text-[#F5F0EA]">
            {dt.getDate()}
          </div>
        </div>

        {/* Type badge — top right */}
        <div className="absolute right-3 top-3">
          <TypeBadge type={event.event_type} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold text-[#F5F0EA] leading-tight">{event.title}</h3>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[12px] text-[#8A7F74]">
            <Clock size={12} />
            <span>{dateStr} · {timeStr}</span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-1.5 text-[12px] text-[#8A7F74]">
              <MapPin size={12} />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
          {event.communities?.name && (
            <div className="flex items-center gap-1.5 text-[12px] text-[#8A7F74]">
              <Users size={12} />
              <span>{event.communities.name}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-3 text-[13px] leading-relaxed text-[#F5F0EA]/80 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-[#8A7F74]">
            <Users size={13} />
            <span>{fmtCount(0)} going</span>
          </div>

          <button
            onClick={handleRsvp}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95"
            style={rsvpd ? {
              background: '#C8521A18',
              color: '#C8521A',
              border: '1px solid #C8521A40',
            } : {
              background: '#C8521A',
              color: 'white',
            }}
          >
            {rsvpd && <CheckCircle2 size={14} />}
            {rsvpd ? 'Going' : 'RSVP'}
          </button>
        </div>

        {/* Host */}
        <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: '#2E2822' }}>
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#C8521A,#6B2D1A)' }}
          >
            {(event.profiles?.full_name || event.profiles?.username || '?')[0].toUpperCase()}
          </div>
          <span className="text-[11px] text-[#8A7F74]">
            Hosted by <span className="font-semibold text-[#F5F0EA]">
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
  const [tab, setTab] = useState<EventTab>('upcoming');
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');

  const { events, isLoading, createEvent } = useEvents();

  const myEvents = events.filter(e => e.created_by === profile?.id);

  const filtered = (tab === 'mine' ? myEvents : events).filter(e =>
    !query || e.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleRsvp = async (eventId: string, rsvpd: boolean) => {
    if (!profile) return;
    if (rsvpd) {
      const { error } = await supabase
        .from('event_rsvps')
        .insert({ event_id: eventId, user_id: profile.id });
      if (error) toast.error('Failed to RSVP');
      else toast.success('You\'re going! 🎉');
    } else {
      await supabase.from('event_rsvps').delete()
        .match({ event_id: eventId, user_id: profile.id });
      toast.success('RSVP removed');
    }
  };

  return (
    <div className="pb-24">

      {/* Header */}
      <div
        className="sticky top-14 z-20 border-b"
        style={{
          background: 'rgba(15,13,11,0.95)',
          backdropFilter: 'blur(16px)',
          borderColor: '#2E2822',
        }}
      >
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div
            className="flex items-center gap-2 rounded-2xl border px-3.5 py-2.5"
            style={{ background: '#1C1814', borderColor: '#2E2822' }}
          >
            <Search size={16} color="#8A7F74" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search events…"
              className="flex-1 bg-transparent text-sm text-[#F5F0EA] outline-none placeholder:text-[#8A7F74]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {(['upcoming', 'mine'] as EventTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex-1 py-2.5 text-sm font-semibold transition"
              style={{ color: tab === t ? '#F5F0EA' : '#8A7F74' }}
            >
              {t === 'upcoming' ? 'Upcoming' : 'My Events'}
              {tab === t && (
                <motion.span
                  layoutId="events-tab"
                  className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
                  style={{ background: '#C8521A' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl skeleton" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={26} color="#8A7F74" />}
            title={tab === 'mine' ? 'No events created yet' : 'No upcoming events'}
            subtitle={tab === 'mine' ? 'Host an event for the community.' : 'Check back soon or create one.'}
            action={
              tab === 'mine' ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white"
                  style={{ background: '#C8521A' }}
                >
                  <Plus size={16} /> Create Event
                </button>
              ) : undefined
            }
          />
        ) : (
          <AnimatePresence>
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={profile?.id}
                onRsvp={handleRsvp}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-4 flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition active:scale-95 z-20"
        style={{
          background: '#C8521A',
          boxShadow: '0 4px 20px rgba(200,82,26,0.45)',
        }}
        aria-label="Create event"
      >
        <Plus size={22} color="white" />
      </button>

      <CreateEventModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
