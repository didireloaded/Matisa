import { Search, TrendingUp, Mic, Hash, Users, Activity as ActivityIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const trendingTopics = [
  { id: 1, type: 'hashtag', title: '#WindhoekNights', views: '12.4K' },
  { id: 2, type: 'voice', title: 'Late Night Thoughts', views: '8.2K' },
  { id: 3, type: 'community', title: 'Namibian Creatives', views: '5.1K' },
  { id: 4, type: 'discussion', title: 'Best Coffee in Town?', views: '3.9K' },
];

export function Explore() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search people, music, and voice..." 
            className="w-full bg-card border-none rounded-full py-2 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        
        {/* Trending Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground font-display">Trending Now</h2>
          </div>
          
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                    {topic.type === 'hashtag' && <Hash className="w-5 h-5 text-secondary" />}
 
<truncated 2372 bytes>