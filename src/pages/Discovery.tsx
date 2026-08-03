import { useState } from "react";
import { Search, Phone, Video, MoreHorizontal, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/common/Avatar";
import { USERS } from "@/data/dummy";

export function Discovery() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const billboardItems = [
    {
      id: "b-1",
      name: "Stacy Calhoun",
      subtitle: "Fall of Humanity",
      gradient: "linear-gradient(135deg, #0d687b 0%, #053748 100%)",
      borderColor: "rgba(36, 163, 199, 0.4)",
    },
    {
      id: "b-2",
      name: "Zirka Event",
      subtitle: "Most Engage Host",
      gradient: "linear-gradient(135deg, #09653a 0%, #04361e 100%)",
      borderColor: "rgba(53, 198, 122, 0.4)",
    },
    {
      id: "b-3",
      name: "Ndapewa Live",
      subtitle: "Acoustic Lounge",
      gradient: "linear-gradient(135deg, #5c1178 0%, #300742 100%)",
      borderColor: "rgba(97, 57, 242, 0.4)",
    },
    {
      id: "b-4",
      name: "Gazza & Friends",
      subtitle: "Windhoek Special",
      gradient: "linear-gradient(135deg, #565c09 0%, #2d3103 100%)",
      borderColor: "rgba(255, 157, 46, 0.4)",
    },
  ];

  const discoveryPosts = [
    {
      id: "post-1",
      author: "Grace Cary",
      username: "grace_cary",
      avatar: USERS[0].avatar,
      time: "5m ago",
      caption: "Louis Tomlinson opens up on solo creativity under the Namibian sky.",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "post-2",
      author: "Kboz Producer",
      username: "kboz_music",
      avatar: USERS[1].avatar,
      time: "18m ago",
      caption: "Inside the studio working on new afro-house beats.",
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-28 pt-2">
      {/* 1. Reelio Top Header Bar */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/profile")}
          className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-white/20"
        >
          <Avatar
            size={40}
            profile={{
              id: "me",
              display_name: "Me",
              avatar_url: USERS[0].avatar,
            }}
          />
        </button>

        <h1 className="text-xl font-bold text-white tracking-tight font-display">Discover</h1>

        <button
          onClick={() => setSearchOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:bg-white/10 transition active:scale-95 border border-white/15"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Search Bar Drawer if Toggled */}
      {searchOpen && (
        <div className="px-5 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, events & notes..."
            className="w-full h-11 px-4 rounded-full glass-panel text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#24A3C7]"
          />
        </div>
      )}

      {/* 2. Reelio Category Filter Pills */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#24A3C7] to-[#6139F2] text-white shadow-md border border-white/20 whitespace-nowrap">
          All
        </button>
        <button
          onClick={() => navigate("/rooms")}
          className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel text-white/70 hover:text-white flex items-center gap-1.5 whitespace-nowrap border border-[#FF9D2E]/30"
        >
          <Sparkles size={12} className="text-[#FF9D2E]" />
          <span>Voice Notes</span>
        </button>
        <button
          onClick={() => navigate("/rooms")}
          className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel text-white/70 hover:text-white whitespace-nowrap"
        >
          Voice Rooms
        </button>
        <button
          onClick={() => navigate("/events")}
          className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel text-white/70 hover:text-white whitespace-nowrap"
        >
          Events
        </button>
      </div>

      {/* 3. Billboard Section Header */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <h2 className="text-base font-bold text-white tracking-wide">Billboard</h2>
        <span className="h-2 w-2 rounded-full bg-[#24A3C7] shadow-[0_0_8px_rgba(36,163,199,0.8)]" />
      </div>

      {/* 3. Reelio 2x2 Gradient Billboard Card Grid */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        {billboardItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate("/rooms")}
            className="relative h-28 rounded-[22px] p-3.5 flex items-center justify-between cursor-pointer shadow-lg transition active:scale-95 group overflow-hidden border"
            style={{
              background: item.gradient,
              borderColor: item.borderColor,
            }}
          >
            {/* Left Info */}
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-white/90">
                {item.name}
              </h3>
              <p className="text-[10px] text-white/70 font-medium truncate mt-1">{item.subtitle}</p>
            </div>

            {/* Right Action Container */}
            <div className="flex flex-col gap-2 p-1.5 rounded-2xl glass-panel-elevated backdrop-blur-md border border-white/20">
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/90 hover:text-white"
                aria-label="Call"
              >
                <Phone size={12} />
              </button>
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/90 hover:text-white"
                aria-label="Video"
              >
                <Video size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Media Feed Posts Below Billboard */}
      <div className="px-5 space-y-5 flex-1">
        {discoveryPosts.map((post) => (
          <div
            key={post.id}
            className="relative h-[420px] w-full rounded-[28px] overflow-hidden shadow-2xl border border-white/15 bg-black"
          >
            <img
              src={post.image}
              alt={post.author}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

            {/* Top Left Header Inside Image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <Avatar
                  size={26}
                  profile={{
                    id: "author",
                    display_name: post.author,
                    avatar_url: post.avatar,
                  }}
                />
                <span className="text-xs font-bold text-white">@{post.username}</span>
                <span className="text-[10px] text-white/50">{post.time}</span>
              </div>

              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/15">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Bottom Left Caption & Heart Button */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
              <p className="text-xs text-white/95 leading-relaxed font-semibold max-w-[240px] drop-shadow-md">
                {post.caption}
              </p>

              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-90 transition">
                <Heart size={20} fill="white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Discovery;
