-- Performance optimization indexes
-- This migration adds indexes for critical queries

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at 
ON posts(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_is_public_created_at 
ON posts(is_public, created_at DESC) 
WHERE deleted_at IS NULL AND is_public = true;

-- Users search index (full-text search)
CREATE INDEX IF NOT EXISTS idx_users_username_tsvector 
ON users USING GIN(to_tsvector('english', username));

CREATE INDEX IF NOT EXISTS idx_users_display_name_tsvector 
ON users USING GIN(to_tsvector('english', COALESCE(display_name, '')));

-- Messages for real-time performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id_created_at 
ON messages(room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_user_id_room_id 
ON messages(user_id, room_id);

-- Engagement indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id 
ON likes(post_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_likes_user_id 
ON likes(user_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_likes_user_post 
ON likes(user_id, post_id) 
WHERE deleted_at IS NULL;

-- Followers
CREATE INDEX IF NOT EXISTS idx_followers_user_id 
ON followers(user_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_followers_follower_id 
ON followers(follower_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_followers_user_follower 
ON followers(user_id, follower_id) 
WHERE deleted_at IS NULL;

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id 
ON bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_post 
ON bookmarks(user_id, post_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id 
ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id 
ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at DESC);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_start_at 
ON events(start_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_user_id 
ON events(user_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_location 
ON events(latitude, longitude) 
WHERE deleted_at IS NULL;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created 
ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read_at DESC);
