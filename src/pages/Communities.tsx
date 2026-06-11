import { Users, Search, MapPin, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function Communities() {
  const communities = [
    {
      id: 1,
      name: 'Windhoek Tech',
      members: '1.2k',
      posts: '5 today',
      image: 'https://picsum.photos/seed/tech/200/200'
    },
    {
      id: 2,
      name: 'Namibia Foodies',
      members: '3.4k',
      posts: '12 today',
      image: 'https://picsum.photos/seed/foodies/200/200'
    },
    {
      id: 3,
      name: 'Local Hiking Club',
      members: '856',
      posts: '2 today',
      image: 'https://picsum.photos/seed/hike/200/200'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 pb-24 animate-fade-in relative">
      <div className="pt-12 pb-4 sticky top-0 bg-background/90 backdrop-blur-md z-10 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Communities</h1>
        <button className="p-2 bg-primary/10 text-primary rounded-full">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mt-2 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search communities..." 
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <h2 className="text-xl font-bold font-display mb-4">Suggested for You</h2>

      <div className="space-y-4">
        {communities.map((community) => (
          <Card key={community.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <img src={community.image} alt={community.name} clas
<truncated 947 bytes>