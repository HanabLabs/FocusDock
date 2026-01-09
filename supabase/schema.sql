-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'monthly', 'lifetime')),
  github_connected BOOLEAN DEFAULT FALSE,
  github_username TEXT,
  github_access_token TEXT,
  github_last_synced_at TIMESTAMP WITH TIME ZONE,
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_last_synced_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- GitHub commits table
CREATE TABLE IF NOT EXISTS public.github_commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  commit_count INTEGER NOT NULL DEFAULT 1,
  repository TEXT NOT NULL,
  is_squash BOOLEAN DEFAULT FALSE,
  is_merge BOOLEAN DEFAULT FALSE,
  is_bot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, date, repository)
);

-- GitHub recent commits table (stores latest 5 commits with messages)
CREATE TABLE IF NOT EXISTS public.github_recent_commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  repository TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, repository, message, date)
);

-- Work sessions table
CREATE TABLE IF NOT EXISTS public.work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Spotify sessions table
CREATE TABLE IF NOT EXISTS public.spotify_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  artist_name TEXT NOT NULL,
  track_name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_github_commits_user_date ON public.github_commits(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON public.work_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_spotify_sessions_user_date ON public.spotify_sessions(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_recent_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own commits"
  ON public.github_commits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commits"
  ON public.github_commits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commits"
  ON public.github_commits FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recent commits"
  ON public.github_recent_commits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent commits"
  ON public.github_recent_commits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent commits"
  ON public.github_recent_commits FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own work sessions"
  ON public.work_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work sessions"
  ON public.work_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own spotify sessions"
  ON public.spotify_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spotify sessions"
  ON public.spotify_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
