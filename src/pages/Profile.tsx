import { Settings, Share, Link as LinkIcon, Calendar, MapPin, Play, Smile, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

import { EditProfileModal } from '../components/profile/EditProfileModal';

export function Profile() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-foreground">@{profile.username}</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-card rounded-full hover:bg-muted transition-colors border border-border">
            <Share className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 bg-card rounded-full hover:bg-muted transition-colors border border-border">
            <Settings className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="h-40 relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80" alt="Cover" className="w-full h-full object-cover" />
      </div>

      <div className="px-4 relative z-20 -mt-12">
        {/* Avatar & Edit Profile */}
        <div className="flex justify-between items-end mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-card overflow-hidden shadow-lg relative">
              <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {/* Mood Indicator */}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <Smile className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
          <EditProfileModal>
            <button className="px-5 py-1.5 border border-border rounded-full font-semibold text-sm hover:bg-muted transition-colors text-foreground mb-2">
              Edit profile
            </button>
          </EditProfileModal>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground font-display">{profile.fullName}</h2>
          
          {/* Profile Voicemail */}
          <div className="my-3 flex items-center p-2 rounded-xl bg-card border border-border inline-flex space-x-3 pr-4">
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
            <div className="flex flex-col justify-center">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide">Profile Voicemail</div>
              <div className="flex items-center space-x-1 h-3 mt-0.5">
                 {/* Fake waveform */}
                 {[1,2,3,4,5,6,7,8].map(i => (
                   <div key={i} className="w-1 bg-muted-foreground/50 rounded-full" style={{ height: `${Math.random() * 8 + 4}px` }} />
                 ))}
                 <span className="text-[10px] text-muted-foreground ml-2 font-medium">0:30</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap leading-relaxed">
            {profile.bio || 'No bio yet.'}
          </p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location || 'Windhoek, Namibia'}
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> matisa.app
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex gap-1 hover:underline cursor-pointer group">
              <span className="font-bold text-foreground">1,234</span>
              <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors">Following</span>
            </div>
            <div className="flex gap-1 hover:underline cursor-pointer group">
              <span className="font-bold text-foreground">10.5K</span>
              <span className="text-muted-foreground group-hover:text-foreground/80 transition-colors">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background sticky top-[60px] z-20">
        {['Posts', 'Voice', 'Playlists', 'Likes'].map((tab, i) => (
          <button key={tab} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${i === 0 ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center py-20 text-center bg-background">
        <p className="text-muted-foreground font-medium">No posts yet.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">When {profile.fullName.split(' ')[0]} posts, it'll show up here.</p>
      </div>
    </div>
  );
}
