-- Smart Campus Companion - Supabase Schema Setup
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- 1. Users table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  name text,
  email text,
  role text DEFAULT 'student',
  dept text,
  year integer,
  created_at timestamptz DEFAULT now()
);

-- 2. Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- 3. Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 4. Timetables table (one row per user, items stored as JSONB array)
CREATE TABLE IF NOT EXISTS public.timetables (
  id uuid PRIMARY KEY,
  owner_uid uuid REFERENCES public.users(id) ON DELETE CASCADE,
  items jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz
);

-- 5. Notes metadata table (for uploaded files)
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text,
  path text,
  url text,
  content_type text,
  size bigint,
  created_at timestamptz DEFAULT now()
);

-- 6. Grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  assignment text,
  score numeric,
  max_score numeric,
  grade text,
  semester text,
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES public.users(id)
);

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional: Enable Realtime on tables for live updates
-- Go to Supabase Dashboard → Database → Replication → enable for:
-- - announcements
-- - events  
-- - timetables
-- - notes

-- Optional: Enable Row-Level Security for production
-- Uncomment below to enable RLS:

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user_owns_profile" ON public.users
--   FOR SELECT USING (auth.uid() = id)
--   FOR UPDATE USING (auth.uid() = id);

-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user_owns_notes" ON public.notes
--   FOR SELECT USING (auth.uid() = user_id)
--   FOR INSERT WITH CHECK (auth.uid() = user_id)
--   FOR DELETE USING (auth.uid() = user_id);

-- ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user_owns_timetable" ON public.timetables
--   FOR SELECT USING (auth.uid() = id)
--   FOR INSERT WITH CHECK (auth.uid() = id)
--   FOR UPDATE USING (auth.uid() = id)
--   FOR DELETE USING (auth.uid() = id);
