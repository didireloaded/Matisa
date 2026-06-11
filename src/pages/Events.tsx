import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function Events() {
  const events = [
    {
      id: 1,
      title: 'Namibia Tech Innovators',
      date: 'Tonight, 18:00',
      location: 'Innovation Hub',
      distance: '1.2km',
      attendees: 124,
      image: 'https://picsum.photos/seed/tech/600/300'
    },
    {
      id: 2,
      title: 'Foodies Local Market',
      date: 'Tomorrow, 10:00',
      location: 'City Centre',
      distance: '3.5km',
      attendees: 342,
      image: 'https://picsum.photos/seed/food/600/300'
    },
    {
      id: 3,
      title: 'Amapiano Sundowners',
      date: 'Friday, 16:00',
      location: 'Sky Bar',
      distance: '5km',
      attendees: 512,
      image: 'https://picsum.photos/seed/party/600/300'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 pb-24 animate-fade-in">
      <div className="pt-12 pb-4 sticky top-0 bg-background/90 backdrop-blur-md z-10">
        <h1 className="text-3xl font-display font-bold text-foreground">Events</h1>
        
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Find events near you..." 
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="p-3 bg-card border border-border rounded-xl text-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Today', 'Tomorrow', 'This Weekend', 'Free'].map((filter, i) => (
            <button 
<truncated 2487 bytes>
