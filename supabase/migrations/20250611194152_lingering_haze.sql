/*
  # Create exercises table

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `chapter_number` (integer, chapter number)
      - `exercise_number` (integer, exercise number within chapter)
      - `exercise_type` (text, type of exercise)
      - `data` (jsonb, exercise-specific data)
      - `completed` (boolean, completion status)
      - `completed_at` (timestamptz, completion timestamp)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `exercises` table
    - Add policies for authenticated users to manage their own exercises

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter_number integer NOT NULL,
  exercise_number integer NOT NULL,
  exercise_type text NOT NULL,
  data jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own exercises"
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises"
  ON public.exercises
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for exercises table
DROP TRIGGER IF EXISTS update_exercises_updated_at ON public.exercises;
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS exercises_user_id_idx ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS exercises_chapter_number_idx ON public.exercises(chapter_number);
CREATE INDEX IF NOT EXISTS exercises_completed_idx ON public.exercises(completed);
CREATE INDEX IF NOT EXISTS exercises_updated_at_idx ON public.exercises(updated_at DESC);