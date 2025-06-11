/*
  # Add exercise_responses table

  1. New Tables
    - `exercise_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_id` (text, references book_exercises)
      - `response` (jsonb, stores user's exercise responses)
      - `completed_at` (timestamp)
      - Unique constraint on (user_id, exercise_id)

  2. Security
    - Enable RLS on `exercise_responses` table
    - Add policies for users to manage their own responses
*/

-- Create exercise_responses table
CREATE TABLE IF NOT EXISTS exercise_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL REFERENCES book_exercises(id),
  response jsonb NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE exercise_responses ENABLE ROW LEVEL SECURITY;

-- Policies for exercise_responses
CREATE POLICY "Users can view own responses" 
  ON exercise_responses 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses" 
  ON exercise_responses 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses" 
  ON exercise_responses 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_responses_user ON exercise_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_responses_exercise ON exercise_responses(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_responses_completed ON exercise_responses(completed_at DESC);