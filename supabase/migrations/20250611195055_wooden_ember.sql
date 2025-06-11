/*
  # Create prompts table

  1. New Tables
    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `prompt_text` (text)
      - `category` (text)
      - `success_rating` (integer)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `prompts` table
    - Add policies for authenticated users to manage their own prompts
*/

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  prompt_text text NOT NULL,
  category text NOT NULL,
  success_rating integer NOT NULL,
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