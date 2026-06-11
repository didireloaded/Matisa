import { Settings, Share, Link as LinkIcon, Calendar, MapPin } from 'lucide-react';

export function Profile() {
  return (
    <div className="flex flex-col min-h-full pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-4 py-3 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold">@mike_n</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
            <Share className="w-5 h-5" />
          </button>
          <button className="p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="h-32 bg-secondary relative w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80" alt="Cover" className="w-full h-full object-cover" />
      </div>

      <div className="px-4">
        {/* Avatar & Edit Profile */}
        <div className="flex justify-between items-end -mt-10 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary overflow-hidden relative z-10 shadow-lg">
            <img src="https://i.pravatar.cc/150?u=mike" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="px-4 py-1.5 border border-border rounded-full font-semibold text-sm hover:bg-secondary transition-colors mb-2">
            Edit profile
          </button>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">Michael N.</h2>
          <p className="text-muted-foreground text-sm mb-2">@mike_n</p>
          <p className="text-sm text-foreground/90 mb-3 whitespace
<truncated 2078 bytes>