import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Camera, Loader2, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface EditProfileModalProps {
  children: React.ReactNode;
  currentProfile: any;
  onProfileUpdated?: () => void;
}

export function EditProfileModal({ children, currentProfile, onProfileUpdated }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [fullName, setFullName] = useState(currentProfile?.fullName || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [location, setLocation] = useState(currentProfile?.location || '');
  const [ghostMode, setGhostMode] = useState(currentProfile?.ghost_mode || false);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (open && currentProfile) {
      setFullName(currentProfile.fullName || '');
      setBio(currentProfile.bio || '');
      setLocation(currentProfile.location || '');
      setGhostMode(currentProfile.ghost_mode || false);
      setAvatarUrl(currentProfile.avatarUrl || '');
    }
  }, [open, currentProfile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      try {
        setIsSubmitting(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars
<truncated 5926 bytes>