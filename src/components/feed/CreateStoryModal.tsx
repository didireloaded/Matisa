import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Camera, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface CreateStoryModalProps {
  children: React.ReactNode;
  onStoryCreated?: () => void;
}

export function CreateStoryModal({ children, onStoryCreated }: CreateStoryModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !user) return;
    
    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('stories_media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('stories_media')
        .getPublicUrl(fileName);

      // 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create Story Entry
      const { error: dbError } = await supabase.from('stories').insert([{
        author_id: user.id,
        media_url: p
<truncated 3571 bytes>