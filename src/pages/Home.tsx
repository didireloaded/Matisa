import { Search, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { StoryBubble } from '../components/ui/StoryBubble';
import { PostCard } from '../components/ui/PostCard';
import { useFeed } from '../hooks/useFeed';
import { useStories } from '../hooks/useStories';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { CreateStoryModal } from '../components/feed/CreateStoryModal';

import { Link } from 'react-router-dom';

export function Home() {
  const { posts, isLoading: isFeedLoading, isFetchingMore, hasMore, error: feedError, refetch, loadMore } = useFeed();
  const { stories, isLoading: isStoriesLoading } = useStories();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Matisa</h1>
        <div className="flex items-center gap-4">
          <button className="text-foreground hover:text-primary transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <CreatePostModal onPostCreated={refetch}>
            <button className="text-foreground hover:text-primary transition-colors cursor-pointer">
              <Plus className="w-6 h-6" />
            </button>
          </CreatePostModal>
          <Link to="/messages" className="text-foreground hover:text-primary transition-colors">
            <MessageSquare className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Stories - Activity Bubbles */}
      <div className="w-full border-b border-border bg-background py-3">
        <div className="flex overflow-x-auto no-scrollbar px-4 space-x-4 snap-x">
          <CreateStoryModal onStoryCreated={() => window.location.reload()}>
            <div className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer snap-center relative">
              <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center bg-card">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium truncate w-16 text-center">Add</span>
            </div>
          </CreateStoryModal>

          {isStoriesLoading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            stories.map((story) => (
              <StoryBubble key={story.id} {...story} />
            ))
          )}
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 bg-background pb-20">
        {isFeedLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : feedError ? (
          <div className="p-8 text-center text-destructive">{feedError}</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts yet.</div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {hasMore && (
              <div className="flex justify-center py-6">
                <button 
                  onClick={loadMore} 
                  disabled={isFetchingMore}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isFetchingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                You've caught up!
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <CreatePostModal onPostCreated={refetch}>
        <button className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 z-40 cursor-pointer">
          <Plus className="w-6 h-6" />
        </button>
      </CreatePostModal>
    </div>
  );
}
