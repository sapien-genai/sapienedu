/*
  # Create prompts table

  1. New Tables
    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, not null)
      - `prompt_text` (text, not null)
      - `category` (text, not null)
      - `success_rating` (integer, not null)
      - `notes` (text, optional)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `prompts` table
    - Add policies for authenticated users to manage their own prompts

  3. Performance
    - Add indexes on user_id, category, and created_at columns
*/

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  prompt_text text NOT NULL,
  category text NOT NULL,
  success_rating integer NOT NULL CHECK (success_rating >= 1 AND success_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for prompts table
CREATE POLICY "Users can view their own prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_category_idx ON prompts(category);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);