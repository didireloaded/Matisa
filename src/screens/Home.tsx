import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { usePosts } from "../lib/api/posts";
import {
  MapPin, Users, Globe, CalendarDays, MessageSquare, Radar, ChevronRight,
  Flame, Check, Heart, MessageCircle as CommentIcon, Repeat2, Bookmark, Share2,
  MoreHorizontal, Play, Mic, Camera, Music2, TrendingUp, Clock, Briefcase,
  Tag, Eye, UserPlus, Plus, Sparkles, Clapperboard, Headphones, Gem, Palette,
  Video,
} from "lucide-react";
import type { Post } from "../data/types";
import {
  PROFILES, STORIES, EVENTS, COMMUNITIES, NOTIFICATIONS, OPPORTUNITIES, TRENDING,
  ME_ID, getProfile, fmt,
} from "../data/mock";

const T = { bg: "#0F0D0B", surface: "#1C1814", s2: "#221D18", border: "#2E2822", text: "#F5F0EA", muted: "#8A7F74", primary: "#C8521A", sand: "#E8A055", sky: "#2D7DD2", success: "#4CAF7D" };

function Avatar({ profile, size = 40, ring = false, online = false }: { profile: ReturnType<typeof getProfile>; size?: number; ring?: boolean; online?: boolean }) {
  const inner = <div className="flex h-full w-full items-center justify-center rounded-full text-white font-semibold select-none" style={{ background: profile.gradient, fontSize: size * 0.38 }}>{profile.full_name.charAt(0).toUpperCase()}</div>;
  return (
    <div className="relative flex-shrink-0" style={{ width: ring ? size + 6 : size, height: ring ? size + 6 : size }}>
      {ring ? <div className="story-ring rounded-full h-full w-full p-[2.5px]"><div className="rounded-full overflow-hidden h-full w-full">{inner}</div></div> : <div className="rounded-full overflow-hidden ring-1 ring-black/20" style={{ width: size, height: size }}>{inner}</div>}
      {online && <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#0F0D0B] bg-[#4CAF7D]" style={{ width: 10, height: 10, bottom: ring ? 2 : 0, right: ring ? 2 : 0 }} />}
    </div>
  );
}

function AvatarById({ id, size = 40 }: { id: string; size?: number }) {
  const p = getProfile(id);
  return <Avatar profile={p} size={size} online={p.online} />;
}

function Verified({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#2D7DD2"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
}

function Badge({ children, tone = "primary" }: { children: React.ReactNode; tone?: string }) {
  const cls: Record<string, string> = { primary: "bg-[#C8521A]/15 text-[#E8A055] border-[#C8521A]/25", success: "bg-[#4CAF7D]/15 text-[#4CAF7D] border-[#4CAF7D]/25", sky: "bg-[#2D7DD2]/15 text-[#2D7DD2] border-[#2D7DD2]/25", sand: "bg-[#E8A055]/15 text-[#E8A055] border-[#E8A055]/25", muted: "bg-[#2E2822] text-[#8A7F74] border-[#2E2822]" };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cls[tone]}`}>{children}</span>;
}

function Chip({ children, active = false, tone = "default", small = false, onClick }: { children: React.ReactNode; active?: boolean; tone?: "default" | "primary" | "success" | "sand" | "sky"; small?: boolean; onClick?: () => void }) {
  const size = small ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]";
  const tones: Record<string, string> = {
    default: active ? "border-[#C8521A] bg-[#C8521A] text-white" : "border-[#2E2822] bg-[#1C1814] text-[#8A7F74] hover:border-[#C8521A]/40 hover:text-[#F5F0EA]",
    primary: "border-[#C8521A]/30 bg-[#C8521A]/10 text-[#E8A055]",
    success: "border-[#4CAF7D]/30 bg-[#4CAF7D]/10 text-[#4CAF7D]",
    sand: "border-[#E8A055]/30 bg-[#E8A055]/10 text-[#E8A055]",
    sky: "border-[#2D7DD2]/30 bg-[#2D7DD2]/10 text-[#2D7DD2]",
  };
  return <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border font-medium transition-all whitespace-nowrap select-none ${size} ${tones[tone]}`}>{children}</button>;
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="flex items-end justify-between mb-3"><div><h2 className="font-display text-lg font-bold text-[#F5F0EA]">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-[#8A7F74]">{subtitle}</p>}</div>{action}</div>;
}

function Divider() { return <div className="h-px bg-[#2E2822]" />; }

function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const author = post.profiles || getProfile(post.user_id);
  const [liked, setLiked] = useState(!!post.liked);
  const [saved, setSaved] = useState(!!post.saved);
  const [likes, setLikes] = useState(post.likes_count);

  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <button onClick={() => navigate(`/profile/${author.id}`)}><Avatar profile={author} size={42} online={author.online} /></button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => navigate(`/profile/${author.id}`)} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-semibold text-[#F5F0EA]">{author.full_name}</span>
                {author.is_verified && <Verified size={14} />}
                {author.is_plus && <span className="rounded-full bg-[#E8A055]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#E8A055]">PLUS</span>}
                <span className="text-[#8A7F74]">·</span><span className="text-[#8A7F74] text-xs">{post.created_at}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-[#8A7F74]">@{author.username}</span>
                
                <Badge tone="primary"><MapPin size={9} /> {post.region}</Badge>
              </div>
            </button>
            <button className="text-[#8A7F74] flex-shrink-0"><MoreHorizontal size={18} /></button>
          </div>
          {post.content && <p className="mt-2 text-[14px] leading-relaxed text-[#F5F0EA]">{post.content}</p>}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${post.media_urls.length === 1 ? "grid-cols-1" : post.media_urls.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {post.media_urls.slice(0, 4).map((_, i) => (
                <div key={i} className={`relative aspect-[4/3] ${post.media_urls!.length === 3 && i === 0 ? "row-span-2 aspect-auto" : ""}`} style={{ background: ["linear-gradient(135deg,#C8521A,#6B2D1A)", "linear-gradient(135deg,#2D7DD2,#1A3A60)", "linear-gradient(135deg,#E8A055,#8B5A1A)", "linear-gradient(135deg,#4CAF7D,#1A5C3A)"][i % 4] }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
                  {post.type === "video" && i === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"><Play size={16} fill="white" color="white" /></div></div>}
                </div>
              ))}
            </div>
          )}
          {post.type === "voice" && post.voice_duration && (
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-[#2E2822] bg-[#221D18] px-3 py-2.5">
              <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white"><Play size={12} fill="white" color="white" /></button>
              <div className="flex flex-1 items-center gap-[2px]">
                {Array.from({ length: 28 }).map((_, i) => <span key={i} className="rounded-full bg-[#C8521A]" style={{ width: 2, height: 4 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 16, opacity: i < 11 ? 1 : 0.3 }} />)}
              </div>
              <span className="flex-shrink-0 text-[10px] font-medium text-[#8A7F74]">0:{String(post.voice_duration).padStart(2, "0")}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-[#8A7F74]">
            <button onClick={() => { setLiked(l => !l); setLikes(c => liked ? c - 1 : c + 1); }} className={`flex items-center gap-1.5 text-xs font-medium transition ${liked ? "text-[#C8521A]" : "hover:text-[#C8521A]"}`}><Heart size={18} fill={liked ? "#C8521A" : "none"} /><span>{fmt(likes)}</span></button>
            <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#2D7DD2]"><CommentIcon size={18} /><span>{fmt(post.comments_count)}</span></button>
            <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#4CAF7D]"><Repeat2 size={18} /><span>{fmt(post.reposts_count)}</span></button>
            <button onClick={() => setSaved(s => !s)} className={`flex items-center gap-1.5 text-xs font-medium transition ${saved ? "text-[#E8A055]" : "hover:text-[#E8A055]"}`}><Bookmark size={18} fill={saved ? "#E8A055" : "none"} /><span>{fmt(post.saves_count)}</span></button>
            <button className="hover:text-[#F5F0EA]"><Share2 size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();
  const [feedTab, setFeedTab] = useState<"foryou" | "following">("foryou");
  const me = getProfile(ME_ID);

  const nearbyAll = PROFILES.filter(p => p.distance != null && p.ghost_mode !== "hidden" && p.id !== ME_ID);
  const nearbyOnline = nearbyAll.filter(p => p.online);
  const interestCounts: Record<string, number> = {};
  nearbyAll.forEach(p => p.interests.forEach(i => { interestCounts[i] = (interestCounts[i] || 0) + 1; }));
  const activeCommunities = COMMUNITIES.filter(c => c.today_posts > 0).length;
  const eventsToday = EVENTS.filter(e => e.date === "Today").length;
  const newPostsNearby = (posts || []).filter(p => p.region === me.region && ["2h","3h","5h","6h"].includes(p.created_at)).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const isCreator = me.is_creator;

  const todayNotifs = NOTIFICATIONS.filter(n => n.bucket === "today");
  const profileViews = todayNotifs.filter(n => n.type === "view").length;
  const bookingReqs = todayNotifs.filter(n => n.type === "booking").length;
  const newFollowers = todayNotifs.filter(n => n.type === "follow").length;
  const eventInvites = todayNotifs.filter(n => n.type === "event_invite").length;

  const suggestions = PROFILES.filter(p => p.id !== ME_ID && !p.distance && (p.region === me.region || p.interests.some(i => me.interests.includes(i)))).slice(0, 4);

  const feed = feedTab === "following" ? (posts || []).filter(p => ["u_tangeni","u_didi",ME_ID].includes(p.user_id)) : (posts || []);

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-6 pb-7" style={{ background: "linear-gradient(160deg,#1C1814 0%,#221D18 40%,#0F0D0B 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 75% 30%, rgba(200,82,26,0.4), transparent 55%)" }} />
        <div className="absolute right-4 top-4 flex -space-x-2 opacity-40">
          {nearbyAll.slice(0, 4).map(p => <div key={p.id} className="h-8 w-8 rounded-full border-2 border-[#0F0D0B]" style={{ background: p.gradient }} />)}
        </div>
        <div className="relative">
          <p className="text-xs font-medium text-[#8A7F74] uppercase tracking-wider mb-1">{greeting}{isCreator ? `, ${me.full_name.split(" ")[0]}` : ""}</p>
          <h1 className="font-display text-[26px] font-bold text-[#F5F0EA] leading-tight">See What is Happening<br /><span style={{ color: T.sand }}>Around You</span></h1>
          <p className="mt-2 text-sm text-[#8A7F74] max-w-[280px]">Discover people, conversations, communities and events happening nearby right now.</p>
          <div className="mt-5 flex gap-2.5 flex-wrap">
            <button onClick={() => navigate("/radar")} className="flex items-center gap-2 rounded-full bg-[#C8521A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A8421A]"><Radar size={15} /> Open Radar</button>
            <button onClick={() => navigate("/explore")} className="rounded-full border border-[#2E2822] bg-[#1C1814] px-4 py-2 text-sm font-semibold text-[#F5F0EA]">Explore Nearby</button>
          </div>
        </div>
      </div>

      {/* Live Now */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { value: fmt(nearbyOnline.length + 1), label: "People Nearby", icon: <Users size={14} color={T.primary} />, action: () => navigate("/radar") },
            { value: String(activeCommunities), label: "Communities Active", icon: <Globe size={14} color={T.success} />, action: () => navigate("/communities") },
            { value: String(eventsToday), label: "Events Today", icon: <CalendarDays size={14} color={T.sky} />, action: () => navigate("/events") },
            { value: String(newPostsNearby), label: "New Posts Near You", icon: <MessageSquare size={14} color={T.sand} />, action: () => {} },
          ].map(stat => (
            <button key={stat.label} onClick={stat.action} className="flex items-start gap-2.5 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-3 text-left transition hover:border-[#C8521A]/30">
              <div className="mt-0.5">{stat.icon}</div>
              <div><div className="font-display text-lg font-bold text-[#F5F0EA] leading-none">{stat.value}</div><div className="mt-1 text-[10px] text-[#8A7F74]">{stat.label}</div></div>
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Radar Preview */}
      <div className="px-4 py-5">
        <div className="relative overflow-hidden rounded-3xl border border-[#2E2822]" style={{ background: "linear-gradient(135deg,#1C1814,#221D18)" }}>
          <div className="absolute right-0 top-0 opacity-[0.08]"><Radar size={180} color="#C8521A" /></div>
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4CAF7D] opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4CAF7D]" /></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4CAF7D]">Live Radar</span>
            </div>
            <div className="font-display text-xl font-bold text-[#F5F0EA]">People Nearby Right Now</div>
            <div className="mt-1 text-sm text-[#8A7F74]">{nearbyAll.length} active people within 5km of Windhoek</div>
            <div className="mt-4 space-y-2">
              {(Object.entries(interestCounts) as Array<[string, number]>).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => (
                <div key={label} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-[#C8521A]" /><span className="text-sm text-[#F5F0EA]">{label}</span></div><span className="text-sm font-bold text-[#E8A055]">{count}</span></div>
              ))}
              <div className="flex items-center justify-between border-t border-[#2E2822] pt-2"><div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-[#4CAF7D]" /><span className="text-sm text-[#8A7F74]">Total Active Users</span></div><span className="text-sm font-bold text-[#F5F0EA]">{nearbyAll.length}</span></div>
            </div>
            <div className="mt-5 relative h-28 overflow-hidden rounded-2xl border border-[#2E2822]" style={{ background: "radial-gradient(ellipse at 50% 50%, #221814, #0F0D0B)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(232,160,85,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(232,160,85,0.5) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="radar-ring absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8521A]" />
                <div className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8521A] ring-2 ring-[#0F0D0B]" />
              </div>
              {nearbyAll.slice(0, 5).map((u, i) => {
                const angle = ((u.bearing ?? i * 60) * Math.PI) / 180;
                const r = 25 + ((u.distance ?? 0) / 80);
                return <div key={u.id} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${Math.cos(angle) * r}px), calc(-50% + ${Math.sin(angle) * r}px))` }}><div className="h-5 w-5 rounded-full border border-white/20" style={{ background: u.gradient }} /></div>;
              })}
            </div>
            <button onClick={() => navigate("/radar")} className="mt-4 w-full rounded-2xl bg-[#C8521A] py-3 text-sm font-semibold text-white transition hover:bg-[#A8421A]">Open Full Radar</button>
          </div>
        </div>
      </div>

      <Divider />

      {/* Trending */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Trending Near You" subtitle="What is happening in Windhoek right now" action={<Badge tone="primary"><Flame size={10} /> Live</Badge>} />
        <div className="space-y-2.5">
          {TRENDING.map(t => (
            <button key={t.id} onClick={() => { if (t.type === "event") navigate("/events"); else if (t.type === "community") navigate("/communities"); }} className="flex w-full items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-3 text-left transition hover:border-[#C8521A]/30">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#221D18] text-[#E8A055]">{t.type === "event" ? <TrendingUp size={18} /> : t.type === "community" ? <Users size={18} /> : <MessageSquare size={18} />}</div>
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-[#F5F0EA]">{t.title}</div><div className="text-xs text-[#8A7F74]">{t.subtitle}</div></div>
              <ChevronRight size={16} color="#8A7F74" />
            </button>
          ))}
        </div>
      </div>

      <Divider />

      <Divider />


      {/* Events */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Events This Week" subtitle="Happening in and around Windhoek" action={<button onClick={() => navigate("/events")} className="flex items-center gap-1 text-xs font-semibold text-[#E8A055]">All <ChevronRight size={14} /></button>} />
        <div className="space-y-3">
          {EVENTS.slice(0, 3).map(ev => (
            <div key={ev.id} className="overflow-hidden rounded-2xl border border-[#2E2822] bg-[#1C1814]">
              <div className="h-28 relative" style={{ background: ev.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5"><Badge tone={ev.is_free ? "success" : "primary"}>{ev.is_free ? "Free" : `N$${ev.price}`}</Badge><Badge tone="muted">{ev.category}</Badge></div>
                {ev.has_event_chat && <div className="absolute top-3 right-3"><Badge tone="sky"><MessageSquare size={9} /> Chat Active</Badge></div>}
                <div className="absolute bottom-3 left-3 right-3"><div className="font-display text-base font-bold text-white leading-tight">{ev.title}</div><div className="mt-1 flex items-center gap-2 text-[11px] text-white/80"><MapPin size={11} /><span className="truncate">{ev.location_name}</span><span>·</span><Clock size={11} /><span>{ev.date}</span></div></div>
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">{ev.attendee_ids.slice(0, 3).map(id => <div key={id} className="h-6 w-6 rounded-full border-2 border-[#1C1814]"><AvatarById id={id} size={24} /></div>)}</div>
                    <span className="text-xs text-[#8A7F74]"><span className="text-[#F5F0EA] font-semibold">{fmt(ev.interested_count)}</span> interested · <span className="text-[#F5F0EA] font-semibold">{fmt(ev.rsvp_count)}</span> going</span>
                  </div>
                  <button className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${ev.rsvpd ? "border border-[#4CAF7D] text-[#4CAF7D]" : "bg-[#C8521A] text-white"}`}>{ev.rsvpd ? <span className="flex items-center gap-1"><Check size={12} /> Going</span> : "View Event"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* People You May Know */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="People You May Know" subtitle="Based on your area and interests" />
        <div className="space-y-2.5">
          {suggestions.map(p => {
            const mutual = p.interests.filter(i => me.interests.includes(i)).length;
            const reason = p.region === me.region ? "Lives Nearby" : mutual > 0 ? `${mutual} Mutual Interests` : "Suggested";
            return (
              <button key={p.id} onClick={() => navigate(`/profile/${p.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-3 text-left transition hover:border-[#C8521A]/30">
                <Avatar profile={p} size={48} online={p.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1"><span className="font-semibold text-[#F5F0EA] text-sm">{p.full_name}</span>{p.is_verified && <Verified size={12} />}</div>
                  <div className="text-xs text-[#8A7F74]">{reason} · {p.city}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{p.interests.slice(0, 2).map(i => <Chip key={i} tone="primary" small>{i}</Chip>)}</div>
                </div>
                <button className="rounded-full bg-[#C8521A] px-3 py-1.5 text-xs font-semibold text-white">Connect</button>
              </button>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* Communities */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Active Communities" subtitle="Where Namibians are talking right now" action={<button onClick={() => navigate("/communities")} className="flex items-center gap-1 text-xs font-semibold text-[#E8A055]">All <ChevronRight size={14} /></button>} />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {COMMUNITIES.filter(c => c.today_posts > 0).slice(0, 6).map(c => (
            <button key={c.id} onClick={() => navigate(`/community/${c.id}`)} className="flex-shrink-0 w-44 overflow-hidden rounded-2xl border border-[#2E2822] text-left">
              <div className="h-20 relative" style={{ background: c.gradient }}><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-2 left-3 right-3"><div className="font-display text-sm font-bold text-white leading-tight line-clamp-1">{c.name}</div></div></div>
              <div className="bg-[#1C1814] p-3">
                <div className="text-[10px] text-[#8A7F74]">{fmt(c.member_count)} members</div>
                <div className="mt-1 flex items-center gap-2"><span className="text-[10px] font-semibold text-[#4CAF7D]">{c.today_posts} posts today</span><span className="text-[10px] text-[#8A7F74]">· {c.active_users} active</span></div>
                {c.joined && <div className="mt-1 text-[10px] font-semibold text-[#4CAF7D] flex items-center gap-1"><Check size={10} /> Joined</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Discover */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Discover More" subtitle="Explore everything Matisa has to offer" />
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <MapPin size={18} />, label: "Places", color: "#C8521A", action: () => navigate("/radar") },
            { icon: <CalendarDays size={18} />, label: "Events", color: "#2D7DD2", action: () => navigate("/events") },
            { icon: <Users size={18} />, label: "People", color: "#E8A055", action: () => navigate("/explore") },
            { icon: <Globe size={18} />, label: "Communities", color: "#4CAF7D", action: () => navigate("/communities") },
            { icon: <Sparkles size={18} />, label: "Topics", color: "#6B2D7D", action: () => navigate("/explore") },
            { icon: <Sparkles size={18} />, label: "Stories", color: "#8B3A1F", action: () => navigate("/stories") },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-4 transition hover:border-[#C8521A]/30">
              <span style={{ color: item.color }}>{item.icon}</span><span className="text-[11px] font-medium text-[#F5F0EA]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Stories */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Stories" subtitle="Photo, video, and audio moments" />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {STORIES.map((s, idx) => {
            const p = getProfile(s.user_id);
            const isMe = s.user_id === ME_ID;
            return (
              <button key={s.id} onClick={() => navigate(`/stories?idx=${idx}`)} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[64px]">
                <div className="relative">
                  {s.kind === "audio" ? (
                    <div className="relative">
                      <Avatar profile={p} size={52} />
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F0D0B] bg-[#2D7DD2]"><Mic size={10} color="white" /></div>
                      <div className="absolute -inset-1 rounded-full border-2 border-[#2D7DD2]/40" />
                    </div>
                  ) : <Avatar profile={p} size={52} ring={!isMe && !s.viewed} />}
                  {isMe && <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0F0D0B] bg-[#C8521A]"><Plus size={11} color="white" strokeWidth={2.5} /></div>}
                </div>
                <span className="text-center text-[9px] text-[#8A7F74] line-clamp-1 w-full">{isMe ? "Your story" : p.username.split(".")[0]}</span>
                {s.kind === "audio" && <span className="text-[8px] text-[#2D7DD2] font-medium">Audio</span>}
              </button>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* Today's Activity */}
      <div className="px-4 py-5 space-y-4">
        <SectionHeader title="Today's Activity" subtitle="What happened while you were away" />
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { value: String(profileViews), label: "Profile Views", icon: <Eye size={14} color={T.primary} /> },
            { value: String((todayNotifs.filter(n => n.type === "like").length)), label: "Likes Today", icon: <Heart size={14} color={T.primary} /> },
            { value: String(newFollowers), label: "New Followers", icon: <UserPlus size={14} color={T.success} /> },
            { value: String(eventInvites), label: "Event Invites", icon: <CalendarDays size={14} color={T.sky} /> },
          ].map(stat => (
            <div key={stat.label} className="flex items-start gap-2.5 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-3">
              <div className="mt-0.5">{stat.icon}</div>
              <div><div className="font-display text-lg font-bold text-[#F5F0EA] leading-none">{stat.value}</div><div className="mt-1 text-[10px] text-[#8A7F74]">{stat.label}</div></div>
            </div>
          ))}
        </div>
        {todayNotifs.length > 0 && <button onClick={() => navigate("/notifications")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#2E2822] bg-[#1C1814] py-2.5 text-xs font-semibold text-[#E8A055]">View All Activity <ChevronRight size={14} /></button>}
      </div>

      <Divider />

      {/* (creator marketplace section removed — Matisa is a social discovery app) */}


      {/* Around Namibia Feed */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-end justify-between">
          <div><h2 className="font-display text-lg font-bold text-[#F5F0EA]">Around Namibia</h2><p className="mt-0.5 text-xs text-[#8A7F74]">Latest from across the country</p></div>
        </div>
      </div>
      <div className="sticky top-[60px] z-20 border-b border-[#2E2822] backdrop-blur-lg" style={{ background: "rgba(15,13,11,0.90)" }}>
        <div className="flex px-4">
          {(["foryou","following"] as const).map(t => (
            <button key={t} onClick={() => setFeedTab(t)} className={`flex-1 py-3 text-sm font-semibold transition ${t === feedTab ? "text-[#F5F0EA] tab-active" : "text-[#8A7F74]"}`}>{t === "foryou" ? "For You" : "Following"}</button>
          ))}
        </div>
      </div>
      {isLoading ? <div className="flex justify-center items-center h-40"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8521A] border-t-transparent" /></div> : feed.map(p => <PostCard key={p.id} post={p} />)}
      <div className="py-8 text-center text-xs text-[#8A7F74]">You are all caught up · <span style={{ color: T.sand }}>Matisa</span></div>
    </div>
  );
}
