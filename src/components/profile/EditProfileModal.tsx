import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useProfile } from '../../hooks/useProfile';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function EditProfileModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { profile, updateProfile, uploadAvatar } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile && open) {
      setFullName(profile.fullName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
    }
  }, [profile, open]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
      });
      toast.success('Profile updated successfully!');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground font-display">Edit Profile</DialogTitle>
          <button 
            onClick={handleSave}
            disabled={isSubmitting || isUploading}
            className="text-primary font-bold hover:text-primary/80 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border group">
              <img 
                src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-primary text-sm font-semibold mt-3 hover:underline"
            >
              Change Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell people about yourself..."
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
