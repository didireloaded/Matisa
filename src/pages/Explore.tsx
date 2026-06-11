import { Search, TrendingUp, Mic, Hash, Users, Activity as ActivityIcon, MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface NearbyUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  lat: number;
  lng: number;
  distance: number;
}

interface NearbyCommunity {
  id: string;
  name: string;
  cover_url: string;
  lat: number;
  lng: number;
  distance: number;
}

export function Explore() {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const { session } = useAuthStore();
  
  const [userLocation, setUserLocation] = useState({ lat: -22.5609, lng: 17.0628 });
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [nearbyCommunities, setNearbyCommunities] = useState<NearbyCommunity[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ profiles: any[], communities: any[] }>({ profiles: [], communities: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // 1. Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.warn('Geolocation denied or failed. Using fallback location.', error);
          setIsLoadingLocation(false);
        },
        { timeout: 10000 }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    // 2. Fetch Nearby Users & Communities
    if (isLoadingLocation) return;

    const fetchData = async () => {
      try {
        // Fetch Nearby Users via RPC
        const { data: users, error: rpcError } = await supabase.rpc('find_nearby_users', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          radius_meters: 15000 // 15km
        });
        
        if (!rpcError && users) {
          setNearbyUsers(users);
        }

        // Fetch Nearby Communities via RPC
        const { data: nearbyComms, error: commsRpcError } = await supabase.rpc('find_nearby_communities', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          radius_meters: 15000
        });

        if (!commsRpcError && nearbyComms) {
          setNearbyCommunities(nearbyComms);
        }

        // Fetch Top Communities
        const { data: comms, error: commsError } = await supabase
          .from('communities')
          .select('*')
          .limit(4);
          
        if (!commsError && comms) {
          setCommunities(comms);
        }
      } catch (err) {
        console.error('Error fetching explore data:', err);
      }
    };

    fetchData();
  }, [userLocation, isLoadingLocation]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ profiles: [], communities: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const term = `%${searchQuery}%`;
        
        // Search profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.${term},full_name.ilike.${term}`)
          .limit(5);

        // Search communities
        const { data: comms } = await supabase
          .from('communities')
          .select('id, name, cover_url')
          .ilike('name', term)
          .limit(5);

        setSearchResults({
          profiles: profiles || [],
          communities: comms || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border">
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Matisa..." 
            className="w-full bg-secondary/50 text-foreground placeholder:text-muted-foreground rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          )}
        </div>
      </div>

      {searchQuery.trim() ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {searchResults.profiles.length === 0 && searchResults.communities.length === 0 && !isSearching ? (
            <p className="text-center text-muted-foreground mt-8">No results found for "{searchQuery}"</p>
          ) : (
            <>
              {searchResults.profiles.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">People</h3>
                  <div className="space-y-3">
                    {searchResults.profiles.map(p => (
                      <Link to={`/messages/${p.id}`} key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                        <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-foreground">{p.full_name}</p>
                          <p className="text-xs text-muted-foreground">@{p.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {searchResults.communities.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Communities</h3>
                  <div className="space-y-3">
                    {searchResults.communities.map(c => (
                      <Link to={`/community/${c.id}`} key={c.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                          {c.cover_url ? <img src={c.cover_url} className="w-full h-full object-cover" /> : <Hash className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-8 flex-1 overflow-y-auto">
          {/* Interactive Map Section */}
          <section className="relative h-[300px] rounded-2xl overflow-hidden border border-border shadow-lg">
            {isLoadingLocation ? (
              <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                <Navigation className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <Map
                mapboxAccessToken={mapboxToken}
                initialViewState={{
                  longitude: userLocation.lng,
                  latitude: userLocation.lat,
                  zoom: 12.5
                }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                attributionControl={false}
              >
                {/* Current User Marker */}
                <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
                  <div className="relative group cursor-pointer flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse absolute -z-10" />
                    <div className="bg-primary p-2 rounded-full shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="mt-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-foreground">
                      You
                    </div>
                  </div>
                </Marker>
                
                {/* Nearby Users Markers */}
                {nearbyUsers.map(user => (
                  <Marker key={user.id} longitude={user.lng} latitude={user.lat}>
                    <div className="bg-secondary p-1 rounded-full shadow-lg border-2 border-background cursor-pointer hover:scale-110 transition-transform">
                      <img 
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        className="w-7 h-7 rounded-full object-cover" 
                        alt={user.username}
                      />
                    </div>
                  </Marker>
                ))}

                {/* Nearby Communities Markers */}
                {nearbyCommunities.map(comm => (
                  <Marker key={comm.id} longitude={comm.lng} latitude={comm.lat}>
                    <Link to={`/community/${comm.id}`}>
                      <div className="bg-primary p-1 rounded-md shadow-lg border-2 border-background cursor-pointer hover:scale-110 transition-transform flex items-center justify-center relative group">
                        <Hash className="w-5 h-5 text-white" />
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          {comm.name}
                        </div>
                      </div>
                    </Link>
                  </Marker>
                ))}
              </Map>
            )}
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-foreground z-10">
              {nearbyUsers.length} people nearby
            </div>
          </section>

          {/* Active Communities */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Active Communities</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
              {communities.length > 0 ? communities.map((comm) => (
                <div key={comm.id} className="min-w-[140px] bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {comm.cover_url ? (
                      <img src={comm.cover_url} alt={comm.name} className="w-full h-full object-cover" />
                    ) : (
                      <Hash className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="font-semibold text-sm text-center">{comm.name}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Loading communities...</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
