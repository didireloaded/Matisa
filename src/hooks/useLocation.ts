import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoveryStore } from "@/stores/useDiscoveryStore";

export function useLocation() {
  const { user } = useAuth();
  const { ghostMode } = useDiscoveryStore();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || ghostMode) return;

    // Function to capture and send location
    const updateLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await supabase
                .from("profiles")
                .update({
                  latitude,
                  longitude,
                  last_seen: new Date().toISOString(),
                  online: true,
                })
                .eq("id", user.id);
            } catch (error) {
              console.error("Failed to update location:", error);
            }
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
        );
      }
    };

    // Initial update
    updateLocation();

    // Update every 60 seconds
    intervalRef.current = window.setInterval(updateLocation, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Mark offline on unmount
      if (user) {
        supabase.from("profiles").update({ online: false }).eq("id", user.id);
      }
    };
  }, [user, ghostMode]);
}
