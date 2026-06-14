import { useState, useEffect, useRef } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import useSupercluster from "use-supercluster";
import { supabase } from "@/lib/supabase";
import { useLocation } from "@/hooks/useLocation";
import { FilterBar } from "@/components/discovery/FilterBar";
import { UserBubble } from "@/components/discovery/UserBubble";
import { ProfilePreviewCard } from "@/components/discovery/ProfilePreviewCard";
import type { Profile } from "@/types";
import { DiscoveryAI } from "@/services/ai";
import { useAuth } from "@/contexts/AuthContext";

// Free Dark Mode MapLibre Style
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function Discovery() {
  // Sync current user's location to DB
  useLocation();

  const mapRef = useRef<any>(null);
  const [viewport, setViewport] = useState({
    latitude: -22.5609, // Default to Windhoek
    longitude: 17.0658,
    zoom: 12,
  });

  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());

  // Fetch AI recommended people
  useEffect(() => {
    if (profile) {
      DiscoveryAI.getRecommendedUsers(profile.id)
        .then((users) => {
          if (users) {
            setRecommendedIds(new Set(users.map((u: any) => u.id)));
          }
        })
        .catch(console.error);
    }
  }, [profile]);

  // Fetch users with locations
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (data) setProfiles(data);
    };

    fetchUsers();

    // Subscribe to realtime location updates
    const channel = supabase
      .channel("public:profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        setProfiles((current) => {
          const updatedProfile = payload.new as Profile;
          // Only add/update if they have coordinates
          if (!updatedProfile.latitude || !updatedProfile.longitude) return current;

          const exists = current.find((p) => p.id === updatedProfile.id);
          if (exists) {
            return current.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
          } else {
            return [...current, updatedProfile];
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Format points for supercluster
  const points = profiles.map((profile) => ({
    type: "Feature" as const,
    properties: { cluster: false, profileId: profile.id, profile },
    geometry: { type: "Point" as const, coordinates: [profile.longitude!, profile.latitude!] },
  }));

  const [bounds, setBounds] = useState<any>(null);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <FilterBar />

      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => {
          setViewport(evt.viewState);
          // Set bounds for clustering
          if (mapRef.current) {
            const b = mapRef.current.getMap().getBounds().toArray().flat();
            setBounds(b);
          }
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, profile } = cluster.properties;

          if (isCluster) {
            return (
              <Marker key={`cluster-${cluster.id}`} latitude={latitude} longitude={longitude}>
                <UserBubble
                  cluster
                  pointCount={pointCount}
                  user={null as any}
                  onClickCluster={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20,
                    );
                    setViewport({
                      ...viewport,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                    });
                  }}
                />
              </Marker>
            );
          }

          // Individual User Marker
          return (
            <Marker
              key={`user-${profile.id}`}
              latitude={latitude}
              longitude={longitude}
              style={{ zIndex: recommendedIds.has(profile.id) ? 10 : 1 }}
            >
              <UserBubble user={profile} isRecommended={recommendedIds.has(profile.id)} />
            </Marker>
          );
        })}
      </Map>

      {/* Profile Detail Bottom Sheet */}
      <ProfilePreviewCard />
    </div>
  );
}
