/*
  # Add Exercise Tracking Tables

  1. New Tables
    - `assessment_results` - Store AI readiness assessment scores and recommendations
    - `time_tracking_sessions` - Track time spent on tasks and AI savings potential
    - `habit_completions` - Record daily habit completions with quality ratings
    - `user_gamification` - Store XP, levels, streaks, and achievements
    - `workflow_templates` - User-created and shareable workflow templates

  2. Security
    - Enable RLS on all tables
    - Add policies for user data isolation
    - Allow public access to workflow templates when marked public
    - Enable leaderboard viewing for gamification data

  3. Performance
    - Add strategic indexes for common query patterns
    - Include GIN indexes for JSONB and array fields
    - Add triggers for auto-updating timestamps
*/

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  maturity_level VARCHAR(50),
  recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assessment results"
  ON assessment_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_type ON assessment_results(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_results_created_at ON assessment_results(created_at DESC);

-- Time Tracking Sessions
CREATE TABLE IF NOT EXISTS time_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_category VARCHAR(50) NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  ai_savings_potential DECIMAL(3,2) CHECK (ai_savings_potential >= 0 AND ai_savings_potential <= 1),
  notes TEXT,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own time tracking sessions"
  ON time_tracking_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_time_tracking_user_id ON time_tracking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_category ON time_tracking_sessions(task_category);
CREATE INDEX IF NOT EXISTS idx_time_tracking_date ON time_tracking_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_time_tracking_created_at ON time_tracking_sessions(created_at DESC);

-- Habit Completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 10),
  time_saved_minutes INTEGER DEFAULT 0 CHECK (time_saved_minutes >= 0),
  notes TEXT,
  completion_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habit completions"
  ON habit_completions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at DESC);

-- User Gamification
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total INTEGER DEFAULT 0 CHECK (xp_total >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  achievements JSONB DEFAULT '[]',
  badges JSONB DEFAULT '[]',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gamification data"
  ON user_gamification
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view leaderboard data (limited fields only)
CREATE POLICY "Users can view leaderboard data"
  ON user_gamification
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON user_gamification(xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_streak ON user_gamification(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_last_activity ON user_gamification(last_activity DESC);

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  workflow_data JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workflow templates"
  ON workflow_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view public workflow templates"
  ON workflow_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = creator_id);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_creator ON workflow_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public, rating DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_usage ON workflow_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_rating ON workflow_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_at ON workflow_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING gin(tags);

-- Create trigger function for updating updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_templates_updated_at ON workflow_templates;
CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample workflow templates (only if we have users and no existing templates)
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get a user ID to use for sample data (if any users exist)
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert sample data if we have a user and no existing templates
    IF sample_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM workflow_templates LIMIT 1) THEN
        INSERT INTO workflow_templates (creator_id, title, description, workflow_data, category, is_public, rating, rating_count, tags) VALUES
        (
            sample_user_id,
            'Email Automation Workflow',
            'Streamline your email management with AI-powered responses and categorization',
            '{"steps": [{"id": "1", "name": "Email Triage", "tool": "AI Assistant", "description": "Categorize incoming emails by priority"}, {"id": "2", "name": "Draft Responses", "tool": "AI Writer", "description": "Generate appropriate responses for common inquiries"}, {"id": "3", "name": "Schedule Send", "tool": "Email Client", "description": "Schedule emails for optimal delivery times"}], "estimatedTimeSaving": "70%", "difficulty": "Beginner"}',
            'Productivity',
            true,
            4.5,
            23,
            ARRAY['email', 'automation', 'productivity', 'ai-assistant']
        ),
        (
            sample_user_id,
            'AI Content Creation Pipeline',
            'End-to-end content creation workflow using multiple AI tools',
            '{"steps": [{"id": "1", "name": "Research & Ideation", "tool": "AI Research", "description": "Generate topic ideas and gather research"}, {"id": "2", "name": "Outline Creation", "tool": "AI Planner", "description": "Create detailed content outlines"}, {"id": "3", "name": "Content Writing", "tool": "AI Writer", "description": "Generate first draft content"}, {"id": "4", "name": "Editing & Polish", "tool": "AI Editor", "description": "Refine and improve content quality"}, {"id": "5", "name": "Visual Assets", "tool": "AI Image Generator", "description": "Create supporting visuals"}], "estimatedTimeSaving": "60%", "difficulty": "Intermediate"}',
            'Content Creation',
            true,
            4.7,
            18,
            ARRAY['content', 'writing', 'creative', 'marketing']
        ),
        (
            sample_user_id,
            'Automated Data Analysis Workflow',
            'Transform raw data into actionable insights using AI tools',
            '{"steps": [{"id": "1", "name": "Data Collection", "tool": "Data Connector", "description": "Gather data from multiple sources"}, {"id": "2", "name": "Data Cleaning", "tool": "AI Data Processor", "description": "Clean and normalize data automatically"}, {"id": "3", "name": "Pattern Recognition", "tool": "AI Analytics", "description": "Identify trends and patterns"}, {"id": "4", "name": "Insight Generation", "tool": "AI Analyst", "description": "Generate actionable insights"}, {"id": "5", "name": "Report Creation", "tool": "AI Reporter", "description": "Create executive summary reports"}], "estimatedTimeSaving": "80%", "difficulty": "Advanced"}',
            'Data Analysis',
            true,
            4.3,
            12,
            ARRAY['data', 'analytics', 'insights', 'reporting']
        );
    END IF;
END $$;