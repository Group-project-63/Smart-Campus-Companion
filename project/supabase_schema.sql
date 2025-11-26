-- Supabase schema for Smart-Campus-Companion
-- Run this in your Supabase SQL editor (or psql) to create tables used by the app.

-- Users: store profile data (id matches auth.users.id)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  name text,
  email text,
  role text DEFAULT 'student',
  dept text,
  year integer,
  created_at timestamptz DEFAULT now()
);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience jsonb,
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Timetables: one row per user, items stored as JSONB array
CREATE TABLE IF NOT EXISTS public.timetables (
  id uuid PRIMARY KEY,
  owner_uid uuid REFERENCES public.users(id) ON DELETE CASCADE,
  items jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz
);

-- Notes metadata
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

-- Grades
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

-- Extensions (pgcrypto for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Basic Row Level Security examples (enable RLS if desired)
-- Example: enable RLS on notes so users only see their own notes
-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "notes_user_access" ON public.notes
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- NOTE: Adjust RLS policies and permissions for your security requirements.
-- You may also need to create service_role keys or setup functions for server-side operations.
