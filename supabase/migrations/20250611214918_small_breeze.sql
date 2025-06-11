/*
  # Enhanced Prompt Rating and Feedback System

  1. New Tables
    - `quick_ratings` - Simple 1-5 star ratings
    - `success_stories` - User success stories with optional output sharing
    - `user_rewards` - Points and badges system
    - `prompt_usage_analytics` - Track prompt usage patterns

  2. Enhanced Tables
    - Update `prompt_ratings` to support library prompts
    - Update `prompt_feedback` to support library prompts

  3. Functions
    - Calculate trending scores
    - Award badges based on metrics
    - Update prompt statistics

  4. Security
    - RLS policies for all new tables
    - Proper user isolation
*/

-- Create quick_ratings table for simple star ratings
CREATE TABLE IF NOT EXISTS quick_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('book', 'user', 'library')),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id, prompt_type)
);

-- Create success_stories table
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('book', 'user', 'library')),
  title text NOT NULL,
  description text NOT NULL,
  output_shared boolean DEFAULT false,
  output_content text,
  time_saved integer, -- in minutes
  is_anonymous boolean DEFAULT true,
  is_public boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_rewards table for points and badges
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points_earned integer NOT NULL DEFAULT 0,
  badge_earned text,
  prompt_id text,
  created_at timestamptz DEFAULT now()
);

-- Create prompt_usage_analytics table
CREATE TABLE IF NOT EXISTS prompt_usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('book', 'user', 'library')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- 'view', 'copy', 'rate', 'save'
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Update existing tables to support library prompts
DO $$
BEGIN
  -- Update prompt_ratings to support library prompts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'prompt_ratings_prompt_type_check_updated'
  ) THEN
    ALTER TABLE prompt_ratings DROP CONSTRAINT IF EXISTS prompt_ratings_prompt_type_check;
    ALTER TABLE prompt_ratings ADD CONSTRAINT prompt_ratings_prompt_type_check_updated 
      CHECK (prompt_type IN ('book', 'user', 'library'));
  END IF;

  -- Update prompt_feedback to support library prompts  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'prompt_feedback_prompt_type_check_updated'
  ) THEN
    ALTER TABLE prompt_feedback DROP CONSTRAINT IF EXISTS prompt_feedback_prompt_type_check;
    ALTER TABLE prompt_feedback ADD CONSTRAINT prompt_feedback_prompt_type_check_updated 
      CHECK (prompt_type IN ('book', 'user', 'library'));
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE quick_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quick_ratings
CREATE POLICY "Users can view all quick ratings"
  ON quick_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own quick ratings"
  ON quick_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick ratings"
  ON quick_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick ratings"
  ON quick_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for success_stories
CREATE POLICY "Users can view public success stories"
  ON success_stories
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own success stories"
  ON success_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own success stories"
  ON success_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own success stories"
  ON success_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
  ON user_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow system to award points

-- RLS Policies for prompt_usage_analytics
CREATE POLICY "Users can view aggregated analytics"
  ON prompt_usage_analytics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analytics"
  ON prompt_usage_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quick_ratings_prompt ON quick_ratings(prompt_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_quick_ratings_user ON quick_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_ratings_rating ON quick_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_success_stories_prompt ON success_stories(prompt_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_success_stories_public ON success_stories(is_public, helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_user ON success_stories(user_id);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_action ON user_rewards(action_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_created ON user_rewards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_prompt ON prompt_usage_analytics(prompt_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_analytics_action ON prompt_usage_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON prompt_usage_analytics(created_at DESC);

-- Function to calculate trending score
CREATE OR REPLACE FUNCTION calculate_trending_score(
  prompt_id_param text,
  prompt_type_param text
) RETURNS numeric AS $$
DECLARE
  recent_views integer;
  recent_ratings integer;
  avg_rating numeric;
  trending_score numeric;
BEGIN
  -- Count recent views (last 7 days)
  SELECT COUNT(*) INTO recent_views
  FROM prompt_usage_analytics
  WHERE prompt_id = prompt_id_param 
    AND prompt_type = prompt_type_param
    AND action_type = 'view'
    AND created_at >= NOW() - INTERVAL '7 days';

  -- Count recent ratings (last 7 days)
  SELECT COUNT(*) INTO recent_ratings
  FROM quick_ratings
  WHERE prompt_id = prompt_id_param 
    AND prompt_type = prompt_type_param
    AND created_at >= NOW() - INTERVAL '7 days';

  -- Get average rating
  SELECT AVG(rating) INTO avg_rating
  FROM quick_ratings
  WHERE prompt_id = prompt_id_param 
    AND prompt_type = prompt_type_param;

  -- Calculate trending score (weighted combination)
  trending_score := (recent_views * 0.3) + (recent_ratings * 0.4) + (COALESCE(avg_rating, 0) * 0.3);

  RETURN COALESCE(trending_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get prompt badges
CREATE OR REPLACE FUNCTION get_prompt_badges(
  prompt_id_param text,
  prompt_type_param text
) RETURNS text[] AS $$
DECLARE
  badges text[] := '{}';
  avg_rating numeric;
  rating_count integer;
  success_rate numeric;
  trending_score numeric;
  avg_time_saved numeric;
BEGIN
  -- Get basic stats
  SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
  FROM quick_ratings
  WHERE prompt_id = prompt_id_param AND prompt_type = prompt_type_param;

  -- Calculate success rate (4+ star ratings)
  SELECT 
    CASE WHEN COUNT(*) > 0 
    THEN COUNT(*) FILTER (WHERE rating >= 4)::numeric / COUNT(*)::numeric 
    ELSE 0 END
  INTO success_rate
  FROM quick_ratings
  WHERE prompt_id = prompt_id_param AND prompt_type = prompt_type_param;

  -- Get trending score
  SELECT calculate_trending_score(prompt_id_param, prompt_type_param) INTO trending_score;

  -- Get average time saved
  SELECT AVG(time_saved) INTO avg_time_saved
  FROM success_stories
  WHERE prompt_id = prompt_id_param 
    AND prompt_type = prompt_type_param 
    AND time_saved IS NOT NULL;

  -- Award badges based on criteria
  IF trending_score > 50 THEN
    badges := array_append(badges, '🔥 Trending This Week');
  END IF;

  IF avg_rating >= 4.5 AND rating_count >= 20 THEN
    badges := array_append(badges, '⭐ Community Favorite');
  END IF;

  IF avg_time_saved >= 30 THEN
    badges := array_append(badges, '⚡ Quick Win');
  END IF;

  IF success_rate >= 0.85 AND rating_count >= 10 THEN
    badges := array_append(badges, '🎯 High Success Rate');
  END IF;

  IF avg_time_saved >= 60 THEN
    badges := array_append(badges, '⏰ Time Saver');
  END IF;

  RETURN badges;
END;
$$ LANGUAGE plpgsql;

-- Function to increment helpful count
CREATE OR REPLACE FUNCTION increment_story_helpful(story_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE success_stories 
  SET helpful_count = helpful_count + 1 
  WHERE id = story_id_param;
END;
$$ LANGUAGE plpgsql;