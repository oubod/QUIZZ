/*
  # Initial Database Schema

  1. New Tables
    - `users` - User profiles and game progress
    - `categories` - Quiz categories
    - `questions` - Quiz questions
    - `games` - Game history
    - `user_answers` - Individual answers in games
    - `achievements` - User achievements
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Only admins can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  specialty TEXT,
  avatar_config JSONB DEFAULT '{"bgColor": "from-primary-500 to-secondary-500", "initial": "A"}',
  is_admin BOOLEAN DEFAULT false,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  choices TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'Interne',
  is_ai_generated BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  USING (is_admin = true OR auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Only admins can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (is_admin = true OR auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Only admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (is_admin = true OR auth.jwt() ->> 'user_role' = 'admin');

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  mode TEXT NOT NULL,
  category TEXT,
  score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own games"
  ON games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  game_id UUID REFERENCES games(id),
  is_correct BOOLEAN NOT NULL,
  time_taken NUMERIC,
  points_earned INTEGER DEFAULT 0,
  game_mode TEXT,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own answers"
  ON user_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers"
  ON user_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage achievements"
  ON achievements
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
  ('Cardiologie', 'heart'),
  ('Néphrologie', 'filter'),
  ('Infectiologie', 'virus'),
  ('Pneumologie', 'lungs'),
  ('Gastro-entérologie', 'activity'),
  ('Neurologie', 'brain'),
  ('Endocrinologie', 'flask'),
  ('Hématologie', 'droplet'),
  ('Rhumatologie', 'bone'),
  ('Médecine Interne', 'stethoscope')
ON CONFLICT (name) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (name, description, icon) VALUES
  ('Premier pas', 'Compléter votre premier quiz', 'award'),
  ('Expert en herbe', 'Obtenir un score parfait dans un quiz', 'award'),
  ('Apprenti', 'Atteindre le niveau 5', 'award'),
  ('Médecin', 'Atteindre le niveau 10', 'award'),
  ('Spécialiste', 'Atteindre le niveau 20', 'award'),
  ('Professeur', 'Atteindre le niveau 30', 'award'),
  ('Maître', 'Atteindre le niveau 50', 'award'),
  ('Social', 'Défier 5 amis différents', 'users'),
  ('Champion', 'Gagner 10 matchs multijoueur', 'trophy'),
  ('Assidu', 'Compléter 7 défis quotidiens consécutifs', 'calendar')
ON CONFLICT DO NOTHING;