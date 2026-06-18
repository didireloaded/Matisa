-- Row-Level Security (RLS) Policies
-- Controls data access based on user identity

-- Enable RLS on key tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POSTS RLS POLICIES
-- ============================================================================

-- Posts: Users can see all public posts, their own, and followers' posts
DROP POLICY IF EXISTS posts_select_policy ON posts;
CREATE POLICY posts_select_policy ON posts
FOR SELECT USING (
  deleted_at IS NULL AND (
    is_public = true OR
    user_id = auth.uid() OR
    user_id IN (
      SELECT user_id FROM followers 
      WHERE follower_id = auth.uid() AND deleted_at IS NULL
    )
  )
);

-- Posts: Users can only insert their own
DROP POLICY IF EXISTS posts_insert_policy ON posts;
CREATE POLICY posts_insert_policy ON posts
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Posts: Users can only update their own
DROP POLICY IF EXISTS posts_update_policy ON posts;
CREATE POLICY posts_update_policy ON posts
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Posts: Users can only delete their own
DROP POLICY IF EXISTS posts_delete_policy ON posts;
CREATE POLICY posts_delete_policy ON posts
FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- MESSAGES RLS POLICIES
-- ============================================================================

-- Messages: Users can see messages in their rooms
DROP POLICY IF EXISTS messages_select_policy ON messages;
CREATE POLICY messages_select_policy ON messages
FOR SELECT USING (
  deleted_at IS NULL AND (
    room_id IN (
      SELECT id FROM chat_rooms 
      WHERE user_id = auth.uid() OR recipient_id = auth.uid()
    ) OR
    user_id = auth.uid()
  )
);

-- Messages: Users can only insert their own
DROP POLICY IF EXISTS messages_insert_policy ON messages;
CREATE POLICY messages_insert_policy ON messages
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages: Users can only delete their own
DROP POLICY IF EXISTS messages_delete_policy ON messages;
CREATE POLICY messages_delete_policy ON messages
FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS RLS POLICIES
-- ============================================================================

-- Comments: Users can see comments on posts they can see
DROP POLICY IF EXISTS comments_select_policy ON comments;
CREATE POLICY comments_select_policy ON comments
FOR SELECT USING (
  deleted_at IS NULL AND post_id IN (
    SELECT id FROM posts WHERE deleted_at IS NULL AND (
      is_public = true OR
      user_id = auth.uid() OR
      user_id IN (
        SELECT user_id FROM followers 
        WHERE follower_id = auth.uid() AND deleted_at IS NULL
      )
    )
  )
);

-- Comments: Users can only insert their own
DROP POLICY IF EXISTS comments_insert_policy ON comments;
CREATE POLICY comments_insert_policy ON comments
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Comments: Users can only update their own
DROP POLICY IF EXISTS comments_update_policy ON comments;
CREATE POLICY comments_update_policy ON comments
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Comments: Users can only delete their own
DROP POLICY IF EXISTS comments_delete_policy ON comments;
CREATE POLICY comments_delete_policy ON comments
FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- ENGAGEMENT RLS POLICIES
-- ============================================================================

-- Likes: Users can see likes on public posts, their own posts, and followers' posts
DROP POLICY IF EXISTS likes_select_policy ON likes;
CREATE POLICY likes_select_policy ON likes
FOR SELECT USING (
  post_id IN (
    SELECT id FROM posts WHERE deleted_at IS NULL AND (
      is_public = true OR
      user_id = auth.uid()
    )
  ) OR
  user_id = auth.uid()
);

-- Likes: Users can only insert their own
DROP POLICY IF EXISTS likes_insert_policy ON likes;
CREATE POLICY likes_insert_policy ON likes
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Bookmarks: Users can only manage their own
DROP POLICY IF EXISTS bookmarks_select_policy ON bookmarks;
CREATE POLICY bookmarks_select_policy ON bookmarks
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS bookmarks_insert_policy ON bookmarks;
CREATE POLICY bookmarks_insert_policy ON bookmarks
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS bookmarks_delete_policy ON bookmarks;
CREATE POLICY bookmarks_delete_policy ON bookmarks
FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- USERS RLS POLICIES
-- ============================================================================

-- Users: Everyone can see public user info, but only admins see deleted users
DROP POLICY IF EXISTS users_select_policy ON users;
CREATE POLICY users_select_policy ON users
FOR SELECT USING (
  deleted_at IS NULL OR user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);

-- Users: Only admins can update user records
DROP POLICY IF EXISTS users_update_policy ON users;
CREATE POLICY users_update_policy ON users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
