import { useState, useEffect } from 'react';
import { Search, Trophy, TrendingUp, UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  verified: boolean;
  country: string;
  rank: number;
}

// MOCK DATA for local testing since RPC might not be deployed yet.
const MOCK_TOP_USERS: TopUser[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `mock-${i}`,
  username: `user_${i + 1}`,
  display_name: `User ${i + 1}`,
  avatar_url: `https://i.pravatar.cc/150?u=${i}`,
  followers_count: Math.floor(100000 / (i + 1)),
  verified: i < 5,
  country: 'Namibia',
  rank: i + 1,
}));

function ProfileCard({ user, size }: { user: TopUser, size: 'large' | 'medium' | 'small' }) {
  const isRank1 = user.rank === 1;

  let heightClass = "h-48";
  if (size === 'large' && isRank1) heightClass = "h-72";
  if (size === 'large' && !isRank1) heightClass = "h-64";
  if (size === 'small') heightClass = "h-36";

  return (
    <div className={`relative rounded-3xl overflow-hidden group cursor-pointer bg-[#151515] transition-transform active:scale-95 ${heightClass}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${user.avatar_url})`, opacity: 0.8 }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Rank Badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/10">
        {isRank1 ? <Trophy size={12} className="text-[#FF9D2E]" /> : null}
        <span className={`text-xs font-bold ${isRank1 ? 'text-[#FF9D2E]' : 'text-white'}`}>
          #{user.rank}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-white text-lg leading-none truncate">
            {user.display_name}
          </h3>
          {user.verified && (
            <CheckCircle2 size={16} className="text-[#FF9D2E] fill-[#FF9D2E]/20" />
          )}
        </div>
        <p className="text-[#A0A0A0] text-xs font-medium">@{user.username}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
            {user.followers_count.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Discovery() {
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Attempt to fetch from DB
    async function fetchTopPeople() {
      try {
        const { data, error } = await supabase.rpc('get_top_people', { limit_count: 100 });
        if (error) throw error;
        if (data && data.length > 0) {
          setUsers(data as TopUser[]);
        } else {
          setUsers(MOCK_TOP_USERS);
        }
      } catch (err) {
        console.warn("RPC failed or not found, falling back to mock data");
        setUsers(MOCK_TOP_USERS);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPeople();
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const top20 = filteredUsers.filter(u => u.rank <= 20);
  const bubblingUnder = filteredUsers.filter(u => u.rank > 20);

  return (
    <div className="flex flex-col h-[calc(100dvh-54px-60px)] overflow-hidden bg-[#0B0B0B] text-white">
      {/* Header & Search */}
      <div className="px-4 py-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#A0A0A0]" />
          </div>
          <Input 
            placeholder="Search people..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 bg-[#151515] border-transparent focus:border-[#FF9D2E] rounded-full h-12 text-base"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
        
        {/* Top 20 Section */}
        {top20.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-[#FF9D2E] h-5 w-5" />
              <h2 className="text-xl font-bold tracking-tight">Top People</h2>
            </div>
            
            {/* Masonry-style Grid */}
            <div className="grid grid-cols-2 gap-3">
              {top20.map((user, idx) => {
                if (user.rank === 1) {
                  return (
                    <div key={user.id} className="col-span-2">
                      <ProfileCard user={user} size="large" />
                    </div>
                  );
                }
                if (user.rank <= 3) {
                  return (
                    <div key={user.id} className="col-span-1">
                      <ProfileCard user={user} size="large" />
                    </div>
                  );
                }
                if (user.rank <= 10) {
                  return (
                    <div key={user.id} className="col-span-1">
                      <ProfileCard user={user} size="medium" />
                    </div>
                  );
                }
                return (
                  <div key={user.id} className="col-span-1">
                    <ProfileCard user={user} size="small" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bubbling Under Section */}
        {bubblingUnder.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-[#FF6B6B] h-5 w-5" />
              <h2 className="text-xl font-bold tracking-tight">Bubbling Under</h2>
            </div>
            
            <div className="space-y-3">
              {bubblingUnder.slice(0, 30).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#151515] active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-[#A0A0A0] w-6 text-center text-xs">
                      {user.rank}
                    </div>
                    <div className="relative">
                      <Avatar src={user.avatar_url} size={48} fallback={user.username.substring(0,2)} />
                      {user.verified && (
                        <div className="absolute bottom-0 right-0 bg-[#0B0B0B] rounded-full p-0.5">
                          <CheckCircle2 size={12} className="text-[#FF9D2E] fill-[#FF9D2E]/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-tight text-white">{user.display_name}</span>
                      <span className="text-[#A0A0A0] text-xs">@{user.username}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#FF9D2E] bg-[#FF9D2E]/10 hover:bg-[#FF9D2E]/20 rounded-full">
                    <UserPlus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#A0A0A0]">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p>No people found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
