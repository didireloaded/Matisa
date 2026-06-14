import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Camera, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface CreateStoryModalProps {
  children?: React.ReactNode;
  onStoryCreated?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateStoryModal({ children, onStoryCreated, onOpenChange }: CreateStoryModalProps) {
  const [open, setOpenState] = useState(false);
  const setOpen = (newOpen: boolean) => {
    setOpenState(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
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
        media_url: publicUrlData.publicUrl,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        expires_at: expiresAt.toISOString(),
      }]);

      if (dbError) throw dbError;

      toast.success("Story posted!");
      setOpen(false);
      setPreviewUrl(null);
      if (onStoryCreated) onStoryCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to post story.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground font-display text-center">Add to Story</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*,video/*" 
            className="hidden" 
          />
          
          {previewUrl ? (
             <div className="relative w-full aspect-[9/16] bg-secondary rounded-2xl overflow-hidden border border-border">
               <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-2xl hover:bg-secondary/50 hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
               >
                 <ImageIcon className="w-8 h-8" />
                 <span className="font-semibold text-sm">Upload Media</span>
               </button>
               <button 
                 className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-2xl hover:bg-secondary/50 hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
                 onClick={() => toast.info('Camera capture coming soon!')}
               >
                 <Camera className="w-8 h-8" />
                 <span className="font-semibold text-sm">Take Photo</span>
               </button>
            </div>
          )}

          {previewUrl && (
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => { setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Post Story
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
