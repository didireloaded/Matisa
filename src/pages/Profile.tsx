import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Settings, MessageSquare, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import type { Profile as ProfileType } from '@/types';

function getName(p: ProfileType | null): string {
  if (!p) return '';
  return (p as any).display_name || (p as any).full_name || p.username || '';
}

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: currentUser, loading: authLoading, signOut } = useAuth();

  const isOwnProfile = !id || id === currentUser?.id;
  const targetId = isOwnProfile ? currentUser?.id : id;

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'radar'>('notes');

  useEffect(() => {
    if (authLoading) return;

    if (isOwnProfile) {
      setProfile(currentUser);
      setLoadingProfile(false);
      return;
    }

    if (!id) return;
    setLoadingProfile(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as ProfileType);
        setLoadingProfile(false);
      });
  }, [id, isOwnProfile, currentUser, authLoading]);

  if (authLoading || loadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0B0B]">
        <Loader2 size={32} className="animate-spin text-[#FF9D2E]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-center bg-[#0B0B0B] text-white">
        <p className="text-[#A0A0A0]">Profile not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-[#FF9D2E]">
          Go back
        </Button>
      </div>
    );
  }

  const verified = (profile as any).verified || false;
  const followers = (profile as any).followers_count || 0;
  const following = (profile as any).following_count || 0;
  const country = (profile as any).country || 'Namibia';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0B0B0B] text-white pb-safe">
      {/* Cover Photo Area */}
      <div className="relative w-full h-48 bg-[#151515]">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#151515] to-[#222222]" />
        )}
        
        {/* Gradient Overlay for seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0B0B0B]" />
        
        {/* Top Nav Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white transition hover:bg-black/60">
            <ArrowLeft size={20} />
          </button>
          {isOwnProfile && (
            <button onClick={signOut} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white transition hover:bg-black/60">
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Info Overlay */}
      <div className="relative px-6 -mt-16 flex flex-col items-center z-10">
        {/* Glowing Avatar */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF9D2E] to-[#FF6B6B] rounded-full blur-md opacity-50 scale-110" />
          <div className="relative rounded-full p-1 bg-[#0B0B0B]">
            <Avatar profile={profile} size={100} />
          </div>
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center text-center w-full">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{getName(profile)}</h1>
            {verified && <CheckCircle2 size={18} className="text-[#FF9D2E] fill-[#FF9D2E]/20" />}
          </div>
          <p className="text-[#A0A0A0] text-sm mt-0.5">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm text-center text-white/90 max-w-sm px-4 whitespace-pre-wrap leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 w-full max-w-xs flex gap-3">
          {isOwnProfile ? (
            <Button className="w-full bg-[#151515] text-white hover:bg-[#222222] border border-[#222222] rounded-full font-bold h-12">
              Edit Profile
            </Button>
          ) : (
            <>
              <Button className="flex-1 bg-gradient-to-r from-[#FF9D2E] to-[#FF6B6B] text-white hover:opacity-90 rounded-full font-bold h-12 gap-2 border-0">
                <Plus size={18} /> Follow
              </Button>
              <Button className="w-12 h-12 p-0 bg-[#151515] text-white hover:bg-[#222222] border border-[#222222] rounded-full flex-shrink-0 flex items-center justify-center">
                <MessageSquare size={18} />
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex items-center justify-center w-full max-w-xs gap-8 border-t border-b border-[#151515] py-4">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-white">{followers.toLocaleString()}</span>
            <span className="text-xs text-[#A0A0A0] uppercase tracking-wider font-semibold mt-1">Followers</span>
          </div>
          <div className="w-px h-8 bg-[#151515]" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-white">{following.toLocaleString()}</span>
            <span className="text-xs text-[#A0A0A0] uppercase tracking-wider font-semibold mt-1">Following</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-[#151515]">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'notes' ? 'text-white' : 'text-[#A0A0A0]'}`}
        >
          Notes
          {activeTab === 'notes' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF9D2E]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('radar')}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'radar' ? 'text-white' : 'text-[#A0A0A0]'}`}
        >
          Radar History
          {activeTab === 'radar' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF9D2E]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-[#0B0B0B] p-4">
        {activeTab === 'notes' ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#A0A0A0] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#151515] flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5 opacity-50" />
            </div>
            <p className="font-bold text-white">No Notes Yet</p>
            <p className="text-sm">When {isOwnProfile ? 'you drop' : 'they drop'} a note, it will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#A0A0A0] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#151515] flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5 opacity-50" />
            </div>
            <p className="font-bold text-white">No Radar History</p>
            <p className="text-sm">Explore the radar to leave a trail.</p>
          </div>
        )}
      </div>

    </div>
  );
}
