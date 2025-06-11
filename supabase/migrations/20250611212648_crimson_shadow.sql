/*
  # Rating and Feedback System

  1. New Tables
    - `prompt_ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt_id` (text, references book_prompts.id or prompts.id)
      - `prompt_type` (text, 'book' or 'user')
      - `dimensions` (jsonb, effectiveness/clarity/timeValue scores)
      - `overall_score` (decimal, weighted average)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `prompt_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt_id` (text)
      - `prompt_type` (text, 'book' or 'user')
      - `feedback_type` (text, SUCCESS_STORY/MODIFICATION/ISSUE/SUGGESTION)
      - `title` (text)
      - `content` (text)
      - `is_public` (boolean)
      - `helpful_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own ratings/feedback
    - Add policies for public read access to public feedback
*/

-- Create prompt_ratings table
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('book', 'user')),
  dimensions jsonb NOT NULL,
  overall_score decimal(3,2) NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id, prompt_type)
);

-- Create prompt_feedback table
CREATE TABLE IF NOT EXISTS prompt_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  prompt_type text NOT NULL CHECK (prompt_type IN ('book', 'user')),
  feedback_type text NOT NULL CHECK (feedback_type IN ('SUCCESS_STORY', 'MODIFICATION', 'ISSUE', 'SUGGESTION')),
  title text NOT NULL,
  content text NOT NULL,
  is_public boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_ratings
CREATE POLICY "Users can view all ratings"
  ON prompt_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON prompt_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON prompt_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON prompt_ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for prompt_feedback
CREATE POLICY "Users can view public feedback"
  ON prompt_feedback
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON prompt_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON prompt_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON prompt_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt ON prompt_ratings(prompt_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_user ON prompt_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_feedback_prompt ON prompt_feedback(prompt_id, prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompt_feedback_public ON prompt_feedback(is_public, helpful_count DESC);

-- Create function to update updated_at for ratings
CREATE OR REPLACE FUNCTION update_prompt_rating_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for prompt_ratings
CREATE TRIGGER update_prompt_ratings_updated_at
  BEFORE UPDATE ON prompt_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_rating_updated_at();

-- Create function to increment helpful count
CREATE OR REPLACE FUNCTION increment_feedback_helpful(feedback_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE prompt_feedback 
  SET helpful_count = helpful_count + 1 
  WHERE id = feedback_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;