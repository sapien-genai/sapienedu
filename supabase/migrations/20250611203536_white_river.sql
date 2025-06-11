/*
  # Create Book Content Tables

  1. New Tables
    - `chapters`
      - `number` (integer, primary key)
      - `title` (text)
      - `part` (integer)
      - `created_at` (timestamp)
    - `book_prompts`
      - `id` (text, primary key)
      - `chapter` (integer, references chapters)
      - `category` (text)
      - `title` (text)
      - `prompt` (text)
      - `tags` (text array)
      - `pro_tip` (text, nullable)
      - `is_from_book` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamp)
    - `book_exercises`
      - `id` (text, primary key)
      - `chapter` (integer, references chapters)
      - `exercise_number` (integer)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `fields` (jsonb)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  number INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  part INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create book_prompts table
CREATE TABLE IF NOT EXISTS book_prompts (
  id TEXT PRIMARY KEY,
  chapter INTEGER REFERENCES chapters(number),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  pro_tip TEXT,
  is_from_book BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create book_exercises table
CREATE TABLE IF NOT EXISTS book_exercises (
  id TEXT PRIMARY KEY,
  chapter INTEGER REFERENCES chapters(number),
  exercise_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  fields JSONB NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_book_prompts_chapter ON book_prompts(chapter);
CREATE INDEX IF NOT EXISTS idx_book_prompts_category ON book_prompts(category);
CREATE INDEX IF NOT EXISTS idx_book_prompts_tags ON book_prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_book_exercises_chapter ON book_exercises(chapter);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view book prompts" ON book_prompts FOR SELECT USING (true);
CREATE POLICY "Anyone can view book exercises" ON book_exercises FOR SELECT USING (true);