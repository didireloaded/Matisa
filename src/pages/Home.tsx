import { StoriesBar } from '../components/feed/StoriesBar';
import { PostCard } from '../components/feed/PostCard';
import { Camera, MapPin, Mic, MoreHorizontal, Loader2 } from 'lucide-react';
import { usePosts } from '../lib/api/posts';

export function Home() {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary font-serif italic tracking-wide">Matisa</h1>
        <div className="flex gap-4">
          <Camera className="w-6 h-6 text-foreground hover:text-primary transition-colors cursor-pointer" />
        </div>
      </div>

      <StoriesBar />

      {/* Feed Filter */}
      <div className="flex border-b border-border/50 bg-background sticky top-[60px] z-30">
        <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-primary text-foreground">
          For You
        </button>
        <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
          Following
        </button>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">Failed to load posts.</div>
        ) : posts?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts yet. Be the first!</div>
        ) : (
          posts?.map((post) => (
            <PostCard 
              key={post.id} 
              post={{
                id: post.id,
         
<truncated 1159 bytes>