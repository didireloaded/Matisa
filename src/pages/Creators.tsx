import { useState, useEffect } from "react";
import { Search, MapPin, Music, Star, ArrowRight, Play, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/common/Avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/Tabs";
import { PremiumEmptyState } from "@/components/common/PremiumEmptyState";
import { CreatorService, CreatorProfile } from "@/services/CreatorService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function Creators() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("trending");
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [spotlight, setSpotlight] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spotlightData, trendingData] = await Promise.all([
          CreatorService.getSpotlightCreator(),
          CreatorService.getTrendingCreators(20)
        ]);
        setSpotlight(spotlightData);
        setCreators(trendingData);
      } catch (err) {
        console.error("Failed to load creators", err);
        toast.error("Failed to load creators directory.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBecomeCreator = async () => {
    if (!user) {
      toast.error("Please log in to become a creator");
      return;
    }
    
    setIsApplying(true);
    try {
      const success = await CreatorService.becomeCreator(user.id);
      if (success) {
        toast.success("Welcome to the Creator Program!");
        // We could optimistically update local state if we want, but it's okay for now.
      } else {
        toast.error("Failed to enroll. Please try again later.");
      }
    } catch (err) {
      toast.error("An error occurred while enrolling.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-background)] pb-28">
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-white text-3xl font-display font-bold tracking-tight">Creators</h1>
      </div>

      <div className="px-5 mb-4">
        <Input
          placeholder="Find producers, singers..."
          icon={<Search size={18} />}
          className="h-12 rounded-full border-none bg-[var(--color-surface-2)]"
        />
      </div>

      <div className="px-5 mb-6">
        <Tabs
          variant="pill"
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "trending", label: "Trending" },
            { id: "new", label: "New Arrivals" },
            { id: "local", label: "Near You" },
          ]}
        />
      </div>

      <div className="flex-1 px-5 space-y-8">
        {/* Spotlight */}
        <div>
          <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Spotlight
          </h2>
          <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden group cursor-pointer" onClick={() => spotlight && navigate(`/profile/${spotlight.id}`)}>
            <img
              src={spotlight?.profiles?.cover_url || spotlight?.profiles?.avatar_url || "https://images.unsplash.com/photo-1516280440502-861f23fb0477?w=800&q=80"}
              alt="Spotlight"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Gradient fallback in case image fails */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#FF416C]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 bg-[#FF416C]/20 text-[#FF416C] px-3 py-1 rounded-full border border-[#FF416C]/30 flex items-center gap-1 backdrop-blur-md">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {spotlight ? "Creator of the Week" : "Become a Creator"}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h3 className="text-white font-bold text-2xl mb-1 leading-tight">
                  {spotlight?.profiles?.display_name || "Join the Spotlight"}
                </h3>
                <p className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                  <Music size={14} /> {spotlight?.profiles?.bio ? (spotlight.profiles.bio.length > 30 ? spotlight.profiles.bio.substring(0, 30) + "..." : spotlight.profiles.bio) : "Showcase your talent"}
                </p>
              </div>
              <Button 
                variant="primary" 
                className="h-10 px-5 rounded-full font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBecomeCreator();
                }}
                disabled={isApplying}
              >
                {isApplying ? "Enrolling..." : "Become a Creator"}
              </Button>
            </div>
          </div>
        </div>

        {/* Creator Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Top Creators
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            </div>
          ) : creators.length === 0 ? (
            <PremiumEmptyState
              icon={Users}
              title="No Creators Yet"
              description="Be the first to join the Matisa creator community and showcase your talent."
              glowColor="secondary"
              action={{
                label: "Become a Creator",
                onClick: handleBecomeCreator,
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {creators.map((creator) => {
                const profile = creator.profiles;
                return (
                  <Card
                    key={creator.id}
                    variant="outline"
                    className="p-4 flex flex-col items-center text-center cursor-pointer hover:border-white/20 transition-colors"
                    onClick={() => navigate(`/profile/${creator.id}`)}
                  >
                    <div className="relative mb-3">
                      <Avatar
                        size={72}
                        profile={{
                          id: creator.id,
                          display_name: profile?.display_name || "Creator",
                          avatar_url: profile?.avatar_url,
                        }}
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded-full text-[9px] font-bold text-[var(--color-text-muted)] flex items-center gap-0.5 whitespace-nowrap shadow-sm">
                        <Star size={8} className="text-[#F59E0B]" fill="currentColor" />{" "}
                        {profile?.followers_count || 0}
                      </div>
                    </div>

                    <h3 className="text-white font-bold text-sm truncate w-full mb-0.5 flex items-center justify-center gap-1">
                      {profile?.display_name || "Creator"}
                      {creator.verified && (
                        <span className="text-[var(--color-primary)] ml-1">✓</span>
                      )}
                    </h3>
                    <p className="text-[var(--color-primary)] text-xs font-bold truncate w-full mb-1">
                      Creator
                    </p>
                    <p className="text-[var(--color-text-muted)] text-[10px] truncate w-full flex items-center justify-center gap-1">
                      <MapPin size={10} /> {creator.location || "Global"}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Creators;
