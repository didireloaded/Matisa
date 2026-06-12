import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, MapPin, Loader2, Music, Users } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { toast } from 'sonner';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId?: string; // Optional: prepopulate if opening from a community
}

export function CreateEventModal({ open, onOpenChange, communityId }: CreateEventModalProps) {
  const { createEvent } = useEvents(communityId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'in_person' | 'karaoke'>('in_person');
  const [startTime, setStartTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim() || !startTime) {
      toast.error('Title and Start Time are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
        start_time: new Date(startTime).toISOString(),
        location_name: eventType === 'in_person' ? locationName.trim() : 'Matisa Live Room',
        community_id: communityId,
        coverFile: coverFile || undefined,
      });

      toast.success('Event created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartTime('');
      setLocationName('');
      setCoverFile(null);
      setCoverPreview(null);
      onOpenChange(false);
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-end justify-center" 
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        >
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full h-[90vh] sm:max-w-md bg-background rounded-t-3xl overflow-hidden flex flex-col border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-10">
              <button onClick={() => onOpenChange(false)} className="text-muted-foreground font-medium">Cancel</button>
              <h2 className="font-display font-bold text-foreground">Create Event</h2>
              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="text-primary font-bold hover:text-primary/80 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
              {/* Cover Image */}
              <div 
                className="w-full h-40 bg-secondary rounded-xl border border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-semibold text-muted-foreground">Add Cover Photo</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              {/* Event Type Selection */}
              <div className="flex bg-secondary p-1 rounded-xl">
                <button 
                  onClick={() => setEventType('in_person')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${eventType === 'in_person' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                >
                  <Users className="w-4 h-4" /> Meetup
                </button>
                <button 
                  onClick={() => setEventType('karaoke')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${eventType === 'karaoke' ? 'bg-primary text-white shadow' : 'text-muted-foreground'}`}
                >
                  <Music className="w-4 h-4" /> Karaoke Session
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Event Title" 
                  className="w-full bg-transparent border-b border-border py-3 text-xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />

                <div className="flex items-center gap-3 border-b border-border py-3 text-foreground">
                  <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-sm font-medium" 
                  />
                </div>

                {eventType === 'in_person' && (
                  <div className="flex items-center gap-3 border-b border-border py-3 text-foreground">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                    <input 
                      type="text" 
                      value={locationName}
                      onChange={e => setLocationName(e.target.value)}
                      placeholder="Location Name (e.g. Joe's Beerhouse)" 
                      className="flex-1 bg-transparent focus:outline-none text-sm font-medium placeholder:text-muted-foreground" 
                    />
                  </div>
                )}

                <div className="pt-2">
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What are the details?" 
                    rows={4}
                    className="w-full bg-secondary/50 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
