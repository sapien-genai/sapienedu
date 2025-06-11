/*
  # Create achievements table

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users table)
      - `achievement_type` (text, type of achievement earned)
      - `earned_at` (timestamp, when the achievement was earned)

  2. Security
    - Enable RLS on `achievements` table
    - Add policy for authenticated users to read their own achievements
    - Add policy for authenticated users to insert their own achievements

  3. Indexes
    - Add index on user_id for efficient queries
    - Add index on earned_at for sorting
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_earned_at_idx ON achievements(earned_at DESC);