import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Music2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CreateSongModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateSongModal({ open, onClose, onSuccess }: CreateSongModalProps) {
  const { profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!profile || !title || !audioFile) {
      toast.error('Title and audio file are required');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Cover Image (if provided)
      let coverUrl = '';
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${profile.id}/${Date.now()}-cover.${coverExt}`;
        const { error: coverError, data: coverData } = await supabase.storage
          .from('music')
          .upload(coverPath, coverFile);
          
        if (coverError) throw coverError;
        coverUrl = supabase.storage.from('music').getPublicUrl(coverPath).data.publicUrl;
      }

      // 2. Upload Audio File
      const audioExt = audioFile.name.split('.').pop();
      const audioPath = `${profile.id}/${Date.now()}-audio.${audioExt}`;
      const { error: audioError, data: audioData } = await supabase.storage
        .from('music')
        .upload(audioPath, audioFile);
        
      if (audioError) throw audioError;
      const audioUrl = supabase.storage.from('music').getPublicUrl(audioPath).data.publicUrl;

      // 3. Insert into database
      const { error: dbError } = await supabase.from('songs').insert({
        author_id: profile.id,
        title,
        artist_name: artistName || profile.display_name || profile.username,
        genre,
        cover_url: coverUrl || null,
        audio_url: audioUrl,
      });

      if (dbError) throw dbError;

      toast.success('Song uploaded successfully! 🎵');
      if (onSuccess) onSuccess();
      handleClose();
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Failed to upload song');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setArtistName('');
    setGenre('');
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isUploading ? handleClose : undefined}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#2E2822] bg-[#1C1814] p-6 pb-safe shadow-2xl"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D7DD2]/10 text-[#2D7DD2]">
                <Music2 size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#F5F0EA]">Upload a Track</h2>
              <p className="mt-1 text-sm text-[#8A7F74]">Share your sound with the community.</p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
              
              {/* Audio Upload */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#8A7F74]">
                  Audio File *
                </label>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  ref={audioInputRef} 
                  onChange={handleAudioChange} 
                />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-6 text-sm transition ${
                    audioFile 
                      ? 'border-[#2D7DD2] bg-[#2D7DD2]/10 text-[#2D7DD2]' 
                      : 'border-[#2E2822] bg-[#0F0D0B] text-[#8A7F74] hover:border-[#8A7F74]'
                  }`}
                >
                  {audioFile ? (
                    <>
                      <Music2 size={18} />
                      <span className="truncate max-w-[200px]">{audioFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Select MP3/WAV File
                    </>
                  )}
                </button>
              </div>

              {/* Cover Art */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#8A7F74]">
                  Cover Art (Optional)
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={coverInputRef} 
                  onChange={handleCoverChange} 
                />
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#2E2822] bg-[#0F0D0B] text-[#8A7F74] transition hover:border-[#8A7F74]"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#8A7F74]">Upload a square image for best results.</p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8A7F74]">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Night Vibes"
                  className="w-full rounded-xl border border-[#2E2822] bg-[#0F0D0B] px-4 py-3 text-sm text-[#F5F0EA] placeholder:text-[#8A7F74] focus:border-[#2D7DD2] focus:outline-none focus:ring-1 focus:ring-[#2D7DD2]"
                />
              </div>

              {/* Artist Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8A7F74]">
                  Artist Name (Optional)
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder={profile?.display_name || profile?.username || "Your Name"}
                  className="w-full rounded-xl border border-[#2E2822] bg-[#0F0D0B] px-4 py-3 text-sm text-[#F5F0EA] placeholder:text-[#8A7F74] focus:border-[#2D7DD2] focus:outline-none focus:ring-1 focus:ring-[#2D7DD2]"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8A7F74]">
                  Genre (Optional)
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Amapiano, Hip Hop"
                  className="w-full rounded-xl border border-[#2E2822] bg-[#0F0D0B] px-4 py-3 text-sm text-[#F5F0EA] placeholder:text-[#8A7F74] focus:border-[#2D7DD2] focus:outline-none focus:ring-1 focus:ring-[#2D7DD2]"
                />
              </div>

            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="flex-1 rounded-full border border-[#2E2822] bg-[#0F0D0B] py-3.5 text-sm font-semibold text-[#8A7F74] transition hover:text-[#F5F0EA] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!title.trim() || !audioFile || isUploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2D7DD2] py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                style={{ boxShadow: '0 4px 20px rgba(45, 125, 210, 0.3)' }}
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
