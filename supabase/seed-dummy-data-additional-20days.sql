-- Additional 20 days dummy data for riiriricon@gmail.com (days 31-50)
-- This script adds data for days 31-50 (extending from 30 days to 50 days)
-- Run this script in Supabase SQL Editor after running seed-dummy-data.sql

-- Function to generate GitHub commits dummy data (days 31-50)
DO $$
DECLARE
  user_id_val UUID;
  commit_date DATE;
  repos TEXT[] := ARRAY['main-project', 'side-project', 'api-server', 'frontend-app'];
  repo TEXT;
  commit_count INTEGER;
BEGIN
  -- Get user ID
  SELECT id INTO user_id_val FROM auth.users WHERE email = 'riiriricon@gmail.com' LIMIT 1;
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User with email riiriricon@gmail.com not found in auth.users';
  END IF;

  -- Generate commits for days 31-50 (i = 30 to 49)
  FOR i IN 30..49 LOOP
    commit_date := CURRENT_DATE - i;
    
    -- Generate 1-5 commits per day
    commit_count := floor(random() * 5 + 1)::INTEGER;
    
    -- Distribute commits across repositories
    FOREACH repo IN ARRAY repos LOOP
      IF random() > 0.4 THEN  -- 60% chance of commits in each repo
        INSERT INTO public.github_commits (
          user_id,
          date,
          commit_count,
          repository,
          is_squash,
          is_merge,
          is_bot,
          created_at
        )
        VALUES (
          user_id_val,
          commit_date,
          floor(random() * commit_count + 1)::INTEGER,
          repo,
          random() > 0.8,  -- 20% squash commits
          random() > 0.85, -- 15% merge commits
          false, -- No bot commits
          NOW()
        )
        ON CONFLICT (user_id, date, repository) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Function to generate work sessions dummy data (days 31-50)
DO $$
DECLARE
  user_id_val UUID;
  session_date DATE;
  session_start TIMESTAMP WITH TIME ZONE;
  session_end TIMESTAMP WITH TIME ZONE;
  duration_minutes INTEGER;
  sessions_per_day INTEGER;
BEGIN
  -- Get user ID
  SELECT id INTO user_id_val FROM auth.users WHERE email = 'riiriricon@gmail.com' LIMIT 1;
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User with email riiriricon@gmail.com not found in auth.users';
  END IF;

  -- Generate work sessions for days 31-50 (i = 30 to 49)
  FOR i IN 30..49 LOOP
    session_date := CURRENT_DATE - i;
    
    -- Skip weekends occasionally (80% chance of work on weekdays, 30% on weekends)
    IF EXTRACT(DOW FROM session_date) IN (0, 6) THEN
      IF random() > 0.3 THEN
        CONTINUE;
      END IF;
    ELSE
      IF random() > 0.8 THEN
        CONTINUE;
      END IF;
    END IF;

    -- Generate 1-3 sessions per day
    sessions_per_day := floor(random() * 3 + 1)::INTEGER;
    
    FOR j IN 1..sessions_per_day LOOP
      -- Generate session start time (between 9 AM and 2 PM)
      session_start := (session_date + INTERVAL '9 hours' + INTERVAL '1 hour' * floor(random() * 6)::INTEGER + INTERVAL '1 minute' * floor(random() * 60)::INTEGER);
      
      -- Generate duration (30 minutes to 4 hours)
      duration_minutes := floor(random() * 210 + 30)::INTEGER;
      session_end := session_start + (duration_minutes || ' minutes')::INTERVAL;
      
      INSERT INTO public.work_sessions (
        user_id,
        date,
        duration_minutes,
        started_at,
        ended_at,
        created_at
      )
      VALUES (
        user_id_val,
        session_date,
        duration_minutes,
        session_start,
        session_end,
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

-- Function to generate Spotify sessions dummy data (days 31-50)
DO $$
DECLARE
  user_id_val UUID;
  session_date DATE;
  session_time TIMESTAMP WITH TIME ZONE;
  artist_idx INTEGER;
  artist_name TEXT;
  track_name TEXT;
  duration_ms INTEGER;
  sessions_count INTEGER;
  track_options TEXT[];
BEGIN
  -- Get user ID
  SELECT id INTO user_id_val FROM auth.users WHERE email = 'riiriricon@gmail.com' LIMIT 1;
  
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User with email riiriricon@gmail.com not found in auth.users';
  END IF;

  -- Generate Spotify sessions for days 31-50 (i = 30 to 49)
  FOR i IN 30..49 LOOP
    session_date := CURRENT_DATE - i;
    
    -- Generate 5-30 tracks per day
    sessions_count := floor(random() * 26 + 5)::INTEGER;
    
    FOR j IN 1..sessions_count LOOP
      -- Select random artist index (1-based, 10 artists)
      artist_idx := floor(random() * 10)::INTEGER + 1;
      
      -- Select artist name and tracks based on index
      CASE artist_idx
        WHEN 1 THEN
          artist_name := 'Taylor Swift';
          track_options := ARRAY['Anti-Hero', 'Lavender Haze', 'Midnight Rain', 'Snow On The Beach'];
        WHEN 2 THEN
          artist_name := 'The Weeknd';
          track_options := ARRAY['Blinding Lights', 'Save Your Tears', 'Starboy', 'The Hills'];
        WHEN 3 THEN
          artist_name := 'Billie Eilish';
          track_options := ARRAY['bad guy', 'everything i wanted', 'Happier Than Ever', 'When The Party''s Over'];
        WHEN 4 THEN
          artist_name := 'Dua Lipa';
          track_options := ARRAY['Levitating', 'Don''t Start Now', 'Physical', 'Break My Heart'];
        WHEN 5 THEN
          artist_name := 'Ed Sheeran';
          track_options := ARRAY['Shape of You', 'Perfect', 'Thinking Out Loud', 'Castle on the Hill'];
        WHEN 6 THEN
          artist_name := 'Ariana Grande';
          track_options := ARRAY['7 rings', 'thank u, next', 'positions', 'Side to Side'];
        WHEN 7 THEN
          artist_name := 'Post Malone';
          track_options := ARRAY['Circles', 'Sunflower', 'Better Now', 'Congratulations'];
        WHEN 8 THEN
          artist_name := 'Drake';
          track_options := ARRAY['God''s Plan', 'In My Feelings', 'Hotline Bling', 'One Dance'];
        WHEN 9 THEN
          artist_name := 'The Beatles';
          track_options := ARRAY['Hey Jude', 'Here Comes The Sun', 'Come Together', 'Let It Be'];
        WHEN 10 THEN
          artist_name := 'Queen';
          track_options := ARRAY['Bohemian Rhapsody', 'Don''t Stop Me Now', 'We Will Rock You', 'Another One Bites The Dust'];
      END CASE;
      
      -- Select random track from the artist's tracks
      track_name := track_options[floor(random() * array_length(track_options, 1))::INTEGER + 1];
      
      -- Generate duration (2-5 minutes)
      duration_ms := floor(random() * 180000 + 120000)::INTEGER;
      
      -- Generate random time during the day
      session_time := (session_date + INTERVAL '8 hours' + INTERVAL '1 hour' * floor(random() * 12)::INTEGER + INTERVAL '1 minute' * floor(random() * 60)::INTEGER);
      
      INSERT INTO public.spotify_sessions (
        user_id,
        date,
        artist_name,
        track_name,
        duration_ms,
        played_at,
        created_at
      )
      VALUES (
        user_id_val,
        session_date,
        artist_name,
        track_name,
        duration_ms,
        session_time,
        NOW()
      );
    END LOOP;
  END LOOP;
END $$;

