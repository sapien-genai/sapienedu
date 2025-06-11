/*
  # Prompt Library Integration

  1. New Tables
    - `prompt_library` - Professional prompt templates
    - `user_saved_prompts` - Track which library prompts users have saved

  2. Security
    - Enable RLS on new tables
    - Add policies for public read access to prompt library
    - Add policies for user-specific saved prompts

  3. Indexes
    - Add indexes for efficient filtering and searching
*/

-- Create prompt_library table for professional prompts
CREATE TABLE IF NOT EXISTS prompt_library (
  id text PRIMARY KEY,
  title text NOT NULL,
  prompt_template text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  when_to_use text NOT NULL,
  why_it_works text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  times_used integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  author text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Create user_saved_prompts table to track saved library prompts
CREATE TABLE IF NOT EXISTS user_saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- Enable RLS
ALTER TABLE prompt_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_prompts ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_library (public read access)
CREATE POLICY "Anyone can view prompt library"
  ON prompt_library
  FOR SELECT
  TO public
  USING (true);

-- Policies for user_saved_prompts
CREATE POLICY "Users can view their saved prompts"
  ON user_saved_prompts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save prompts"
  ON user_saved_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave prompts"
  ON user_saved_prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library(category);
CREATE INDEX IF NOT EXISTS idx_prompt_library_difficulty ON prompt_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_prompt_library_featured ON prompt_library(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompt_library_tags ON prompt_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_prompt_library_search ON prompt_library USING gin(to_tsvector('english', title || ' ' || prompt_template));

CREATE INDEX IF NOT EXISTS idx_user_saved_prompts_user ON user_saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_prompts_prompt ON user_saved_prompts(prompt_id);