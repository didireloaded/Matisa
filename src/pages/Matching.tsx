import { useState, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Menu, Bell, X, Star, Share2, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface CommunityCard {
  id: string;
  title: string;
  roomName: string;
  members: number;
  tags: string[];
  image: string;
  avatars: string[];
}

export function Matching() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CommunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const { data, error } = await supabase
          .from("communities")
          .select("*")
          .order("member_count", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Map communities to our Card format
        const formattedCards = data.map((community: any) => ({
          id: community.id,
          title: community.description || community.name,
          roomName: community.name,
          members: community.member_count || 1,
          tags: community.category ? [community.category, "Discovery"] : ["Community", "Social"],
          image:
            community.cover_url ||
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
          // Mock avatars for now to preserve the UI design reference
          avatars: [
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${community.id}1`,
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${community.id}2`,
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${community.id}3`,
          ],
        }));

        setCards(formattedCards);
      } catch (err) {
        console.error("Error fetching communities:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      // Swipe Right
      controls.start({ x: "100vw", opacity: 0 }).then(() => {
        setCards((prev) => prev.slice(1));
        controls.set({ x: 0, opacity: 1 });
      });
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe Left
      controls.start({ x: "-100vw", opacity: 0 }).then(() => {
        setCards((prev) => prev.slice(1));
        controls.set({ x: 0, opacity: 1 });
      });
    } else {
      // Return to center
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#E8EAE6] text-black relative overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 z-10">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <Menu className="w-5 h-5 text-black" />
        </button>

        <h1 className="text-xl font-medium tracking-tight">friendlyhours</h1>

        <button className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
          <Bell className="w-5 h-5 text-black" />
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#FF9D2E] rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-white">
            2
          </div>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9D2E]" />
        </div>
      ) : (
        <>
          {/* Room Info (Dynamic based on top card) */}
          {cards[0] && (
            <div className="px-6 flex items-center justify-between z-10 mb-6">
              <div className="flex items-center">
                {cards[0].avatars.map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-full border-[3px] border-[#E8EAE6] bg-gray-200 overflow-hidden ${i !== 0 ? "-ml-4" : ""} shadow-sm z-[${10 - i}]`}
                  >
                    <img src={avatar} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border-[3px] border-[#E8EAE6] -ml-4 flex items-center justify-center text-xs font-bold shadow-sm z-0">
                  +{cards[0].members > 3 ? cards[0].members - 3 : 0}
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-[15px]">{cards[0].roomName}</h3>
                <p className="text-sm text-black/50 flex items-center justify-end gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {cards[0].members} Members
                </p>
              </div>
            </div>
          )}

          {/* Main Card Swiper */}
          <div className="flex-1 relative px-6 pb-28 w-full h-full">
            {cards.length > 0 ? (
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full h-[100%] max-h-[600px] rounded-[40px] relative overflow-hidden bg-white shadow-xl cursor-grab active:cursor-grabbing"
              >
                <img src={cards[0].image} alt="Cover" className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 flex flex-col justify-end p-8">
                  <h2 className="text-[2.5rem] font-bold leading-tight text-white mb-6 tracking-tight">
                    {cards[0].title.split(" ").map((word, i) => (
                      <span key={i}>{word} </span>
                    ))}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {cards[0].tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-[600px] rounded-[40px] bg-white/50 flex items-center justify-center">
                <p className="text-black/50 font-medium">No more rooms to discover.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom Floating Action Pill */}
      {cards.length > 0 && !loading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#1C1C1C] rounded-[40px] p-2 shadow-2xl z-30">
          <button
            onClick={() => {
              controls.start({ x: "-100vw", opacity: 0 }).then(() => {
                setCards((prev) => prev.slice(1));
                controls.set({ x: 0, opacity: 1 });
              });
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <button className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hover:bg-white/10">
            <Star className="w-6 h-6 fill-current" />
          </button>
          <button className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors hover:bg-white/10">
            <Share2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              controls.start({ x: "100vw", opacity: 0 }).then(() => {
                navigate(`/room/${cards[0].id}?title=${encodeURIComponent(cards[0].roomName)}`);
              });
            }}
            className="w-[100px] h-16 rounded-[32px] flex items-center justify-center text-white ml-2 shadow-[0_0_20px_rgba(255,157,46,0.3)] hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF9D2E, #FF6B6B)" }}
          >
            <Heart className="w-7 h-7 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}
