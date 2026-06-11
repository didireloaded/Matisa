import { Image, Video, CalendarPlus, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Create() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Create Post',
      description: 'Share a moment with people nearby.',
      icon: Image,
      color: 'bg-primary/20 text-primary',
    },
    {
      title: 'Add Story',
      description: 'Share a temporary update (24h).',
      icon: Video,
      color: 'bg-secondary/20 text-secondary',
    },
    {
      title: 'Host Event',
      description: 'Create a local event and invite people.',
      icon: CalendarPlus,
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      title: 'Start Community',
      description: 'Build a group around a shared interest.',
      icon: Users,
      color: 'bg-purple-500/20 text-purple-500',
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background px-4 pt-safe animate-slide-up relative">
      <div className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-display font-bold">Create</h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-muted rounded-full hover:bg-muted/80 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid gap-4 mt-4">
        {options.map((opt) => (
          <button 
            key={opt.title}
            className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-colors"
          >
            <div className={`p-3 rounded-xl ${opt.color}`}>
              <opt.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{opt.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
            </div>
          </button>
        ))}
      
<truncated 28 bytes>
