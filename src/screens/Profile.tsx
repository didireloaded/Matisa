import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, MoreHorizontal, UserCheck, UserPlus, MessageCircle, MapPin, Music2, Play, Pause, Mic, Calendar, Heart, Bookmark, Share2, Repeat2, MoreHorizontal as Dots } from "lucide-react";
import { POSTS, PLAYLISTS, ME_ID, getProfile, fmt } from "../data/mock";
import type { Post, Playlist } from "../data/types";

const T = { bg: "#0F0D0B", surface: "#1C1814", s2: "#221D18", border: "#2E2822", text: "#F5F0EA", muted: "#8A7F74", primary: "#C8521A", sand: "#E8A055", sky: "#2D7DD2", success: "#4CAF7D" };

function Avatar({ profile, size = 40, online = false }: { profile: ReturnType<typeof getProfile>; size?: number; online?: boolean }) {
  const inner = <div className="flex h-full w-full items-center justify-center rounded-full text-white font-semibold select-none ring-1 ring-black/20" style={{ background: profile.gradient, fontSize: size * 0.38 }}>{profile.full_name.charAt(0).toUpperCase()}</div>;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {inner}
      {online && <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#0F0D0B] bg-[#4CAF7D]" style={{ width: 10, height: 10 }} />}
    </div>
  );
}

function Verified({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#2D7DD2"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
}

function PostCard({ post }: { post: Post }) {
  const author = post.profiles || getProfile(post.user_id);
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes_count);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <article className="border-b border-[#2E2822] px-4 py-4">
      <div className="flex gap-3">
        <Avatar profile={author} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="text-sm">
              <span className="font-semibold text-[#F5F0EA]">{author.full_name}</span> <span className="text-[#8A7F74]">· {post.created_at}</span>
            </div>
            <Dots size={18} className="text-[#8A7F74]" />
          </div>
          
          {post.type === "voice" && post.voice_duration && (
            <div className="mt-2 flex items-center gap-2.5 rounded-2xl border border-[#2E2822] bg-[#221D18] px-3 py-2.5">
              <button onClick={() => setIsPlaying(!isPlaying)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white">
                {isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" />}
              </button>
              <div className="flex flex-1 items-center gap-[2px]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="rounded-full bg-[#C8521A]" style={{ width: 2, height: 4 + Math.abs(Math.sin((i + (isPlaying ? Date.now()/200 : 0)) * 1.4 + 0.3)) * 16, opacity: i < 11 ? 1 : 0.3 }} />
                ))}
              </div>
              <span className="flex-shrink-0 text-[10px] font-medium text-[#8A7F74]">0:{String(post.voice_duration).padStart(2, "0")}</span>
            </div>
          )}

          {post.content && <p className="mt-2 text-[14px] leading-relaxed text-[#F5F0EA]">{post.content}</p>}
          
          {post.media_urls && post.media_urls.length > 0 && (
             <div className={`mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-[#2E2822] ${post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
               {post.media_urls.slice(0, 4).map((_, i) => (
                 <div key={i} className="relative aspect-[4/3]" style={{ background: author.gradient }}>
                   <div className="absolute inset-0 bg-black/20" />
                   {post.type === "video" && i === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"><Play size={16} fill="white" /></div></div>}
                 </div>
               ))}
             </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[#8A7F74]">
            <button onClick={() => { setLiked(!liked); setLikes(c => liked ? c - 1 : c + 1); }} className={`flex items-center gap-1.5 text-xs font-medium transition ${liked ? "text-[#C8521A]" : "hover:text-[#C8521A]"}`}><Heart size={18} fill={liked ? "#C8521A" : "none"} /><span>{fmt(likes)}</span></button>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#2D7DD2]"><MessageCircle size={18} /><span>{fmt(post.comments_count)}</span></button>
              <button className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#2D7DD2]/10 hover:text-[#2D7DD2] ml-1"><Mic size={14} /></button>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#4CAF7D]"><Repeat2 size={18} /><span>{fmt(post.reposts_count)}</span></button>
            <button className="flex items-center gap-1.5 text-xs font-medium hover:text-[#E8A055]"><Bookmark size={18} /><span>{fmt(post.saves_count)}</span></button>
            <button className="hover:text-[#F5F0EA]"><Share2 size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = id || ME_ID;
  const u = getProfile(userId);
  const isMe = u.id === ME_ID;
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<"Posts"|"Voice"|"Photos"|"Playlists"|"About">("Posts");
  const [playingIntro, setPlayingIntro] = useState(false);

  const userPosts = POSTS.filter(p => p.user_id === u.id);
  const voicePosts = userPosts.filter(p => p.type === "voice");
  const userPlaylists = PLAYLISTS.filter(p => p.user_id === u.id);

  return (
    <div className="min-h-screen bg-[#0F0D0B] pb-10">
      {/* 1. Cover Gradient */}
      <div className="relative h-44" style={{ background: u.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0B] to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white transition hover:bg-black/60"><ArrowLeft size={18} /></button>
        <button onClick={() => isMe ? navigate("/settings") : undefined} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white transition hover:bg-black/60">{isMe ? <Settings size={17} /> : <MoreHorizontal size={17} />}</button>
      </div>

      <div className="-mt-16 px-4">
        {/* 2 & 3. Avatar and Actions */}
        <div className="flex items-end justify-between">
          <div className="rounded-full border-4 border-[#0F0D0B]"><Avatar profile={u} size={96} online={u.online} /></div>
          <div className="flex gap-2 pb-2">
            {isMe ? (
              <button onClick={() => navigate("/settings")} className="rounded-full border border-[#2E2822] bg-[#1C1814] px-4 py-1.5 text-sm font-semibold text-[#F5F0EA] transition hover:bg-[#221D18]">Edit Profile</button>
            ) : (
              <>
                <button className="flex h-9 items-center justify-center rounded-full border border-[#2E2822] bg-[#1C1814] px-4 text-sm font-semibold text-[#F5F0EA] transition hover:bg-[#221D18]"><MessageCircle size={16} className="mr-2" /> Message</button>
                <button onClick={() => setFollowing(!following)} className={`flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${following ? "border border-[#2E2822] bg-[#1C1814] text-[#F5F0EA]" : "bg-[#C8521A] text-white"}`}>{following ? <UserCheck size={16} className="mr-2" /> : <UserPlus size={16} className="mr-2" />} {following ? "Following" : "Follow"}</button>
              </>
            )}
          </div>
        </div>

        {/* 4. Identity Info */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-[#F5F0EA]">{u.full_name}</h1>
            {u.is_verified && <Verified size={18} />}
            {u.is_plus && <span className="rounded-full bg-[#E8A055]/15 px-2 py-0.5 text-[10px] font-bold text-[#E8A055]">PLUS</span>}
          </div>
          <div className="text-sm text-[#8A7F74]">@{u.username}</div>
          
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8A7F74]">
            <MapPin size={12} /> {u.city}, {u.region}
          </div>
          
          {u.mood && (
            <div className="mt-3">
              <span className="inline-block rounded-full border border-[#C8521A]/25 bg-[#C8521A]/10 px-3 py-1 text-xs font-medium text-[#E8A055]">{u.mood}</span>
            </div>
          )}
        </div>

        {/* 5. Voice Intro Card */}
        <div className="mt-5">
          {u.voice_intro_url ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#221D18] p-3 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1C1814] text-[#C8521A]">
                <Mic size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A7F74] mb-1">Voice Intro</div>
                <div className="flex items-center gap-[3px]">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span key={i} className="rounded-full bg-[#C8521A]" style={{ width: 2, height: 4 + Math.abs(Math.sin((i + (playingIntro ? Date.now()/200 : 0)) * 1.4 + 0.3)) * 14, opacity: i < 15 ? 1 : 0.4, transition: "height 0.1s ease" }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button onClick={() => setPlayingIntro(!playingIntro)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8521A] text-white shadow-md transition active:scale-95">
                  {playingIntro ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
                </button>
                <span className="text-[10px] font-medium text-[#8A7F74]">0:{String(u.voice_intro_duration).padStart(2, "0")}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-[#2E2822] border-dashed bg-[#1C1814] p-4 text-center">
               <span className="text-sm text-[#8A7F74]">No voice intro yet</span>
               {isMe && <button className="text-sm font-semibold text-[#C8521A]">Record</button>}
            </div>
          )}
        </div>

        {/* 6. Current Song */}
        {u.song_title && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#2E2822] bg-[#1C1814] p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2D7DD2] to-[#1A3A60] text-white shadow-inner"><Music2 size={16} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-[#F5F0EA]">{u.song_title}</div>
              <div className="truncate text-[11px] text-[#8A7F74]">{u.song_artist}</div>
            </div>
            <button className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2E2822] text-[#F5F0EA] transition hover:bg-[#C8521A] hover:text-white"><Play size={10} fill="currentColor" /></button>
          </div>
        )}

        {/* 7. Stats Row */}
        <div className="mt-5 flex gap-6 text-[15px]">
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.posts_count)}</span> <span className="text-[#8A7F74]">posts</span></div>
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.followers_count)}</span> <span className="text-[#8A7F74]">followers</span></div>
          <div><span className="font-bold text-[#F5F0EA]">{fmt(u.following_count)}</span> <span className="text-[#8A7F74]">following</span></div>
        </div>
      </div>

      {/* 8. Tabs */}
      <div className="sticky top-[60px] z-20 mt-6 border-b border-[#2E2822] backdrop-blur-md" style={{ background: "rgba(15,13,11,0.85)" }}>
        <div className="flex overflow-x-auto no-scrollbar px-2">
          {(["Posts", "Voice", "Photos", "Playlists", "About"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`relative px-4 py-3 text-[13px] font-semibold transition ${t === tab ? "text-[#F5F0EA]" : "text-[#8A7F74] hover:text-[#F5F0EA]"}`}>
              {t}
              {t === tab && <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#C8521A]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 9. Tab Content */}
      <div className="min-h-[300px]">
        {tab === "Posts" && (
          userPosts.length === 0 ? <div className="py-12 text-center text-sm text-[#8A7F74]">No posts yet</div> : userPosts.map(p => <PostCard key={p.id} post={p} />)
        )}
        
        {tab === "Voice" && (
          <div className="p-4 space-y-4">
            {voicePosts.length === 0 ? <div className="py-10 text-center text-sm text-[#8A7F74]">No voice posts yet</div> : voicePosts.map(p => (
              <div key={p.id} className="rounded-2xl border border-[#2E2822] bg-[#1C1814] p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C8521A] text-white shadow-md">
                    <Play size={14} fill="white" />
                  </button>
                  <div className="flex flex-1 items-center gap-[2px]">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <span key={i} className="rounded-full bg-[#C8521A]" style={{ width: 2, height: 4 + Math.abs(Math.sin(i * 1.4 + 0.3)) * 16, opacity: i < 15 ? 1 : 0.4 }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#8A7F74]">0:{String(p.voice_duration).padStart(2, "0")}</span>
                </div>
                <p className="text-sm text-[#F5F0EA] mb-3">{p.content}</p>
                <div className="flex items-center gap-4 text-[#8A7F74]">
                  <div className="flex items-center gap-1.5 text-xs"><Heart size={14} /> {fmt(p.likes_count)}</div>
                  <div className="flex items-center gap-1.5 text-xs"><MessageCircle size={14} /> {fmt(p.comments_count)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Photos" && (
          <div className="p-1">
             <div className="grid grid-cols-3 gap-1">
               {userPosts.filter(p => p.media_urls).flatMap(p => Array.from({ length: p.media_urls?.length || 1 }).map((_, i) => (
                 <div key={`${p.id}-${i}`} className="aspect-square w-full rounded bg-[#1C1814]" style={{ background: u.gradient }}>
                   <div className="h-full w-full bg-black/10" />
                 </div>
               )))}
             </div>
          </div>
        )}

        {tab === "Playlists" && (
          <div className="p-4 space-y-3">
            {userPlaylists.length === 0 ? <div className="py-10 text-center text-sm text-[#8A7F74]">No playlists yet</div> : userPlaylists.map(pl => (
              <div key={pl.id} className="flex items-center gap-3 rounded-2xl border border-[#2E2822] bg-[#1C1814] p-3 transition hover:bg-[#221D18]">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-inner" style={{ background: pl.gradient }}><Music2 size={24} /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-[#F5F0EA]">{pl.title}</div>
                  <div className="truncate text-xs text-[#8A7F74] mt-0.5">{pl.description}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-[#8A7F74]">
                    <span>{pl.track_count} tracks</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-[#8A7F74]" />
                    <span>{fmt(pl.followers_count)} saves</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "About" && (
          <div className="p-4 space-y-5">
            <div>
              <div className="text-xs font-semibold text-[#8A7F74] mb-1">Name</div>
              <div className="text-sm font-medium text-[#F5F0EA]">{u.full_name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8A7F74] mb-1">Location</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#F5F0EA]"><MapPin size={14} className="text-[#8A7F74]" /> {u.city}, {u.region}</div>
            </div>
            {u.interests.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[#8A7F74] mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {u.interests.map(i => <span key={i} className="rounded-full border border-[#C8521A]/30 bg-[#C8521A]/10 px-2.5 py-1 text-[11px] font-semibold text-[#E8A055]">{i}</span>)}
                </div>
              </div>
            )}
            {u.song_title && (
              <div>
                <div className="text-xs font-semibold text-[#8A7F74] mb-1">Favourite Music</div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#F5F0EA]"><Music2 size={14} className="text-[#2D7DD2]" /> {u.song_title} — <span className="text-[#8A7F74]">{u.song_artist}</span></div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-[#8A7F74] mb-1">Joined</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#F5F0EA]"><Calendar size={14} className="text-[#8A7F74]" /> {u.joined_date}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
