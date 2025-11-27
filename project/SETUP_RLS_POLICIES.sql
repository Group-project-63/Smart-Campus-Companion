-- Setup Row-Level Security (RLS) Policies for Smart Campus Companion
-- Run this in your Supabase SQL Editor AFTER running SETUP_TABLES.sql
-- This allows public inserts to announcements, events, and other tables for admin use

-- ====== IMPORTANT ======
-- If you're in development and want to quickly test without RLS, you can:
-- 1. Disable RLS on tables (simpler for dev)
-- 2. OR set up proper policies below (more secure)

-- ====== OPTION 1: Disable RLS (Development/Testing Only) ======
-- Uncomment the lines below to disable RLS on all tables

-- ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.timetables DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ====== OPTION 2: Enable RLS with Proper Policies (Production) ======

-- Announcements: Allow public reads, allow authenticated inserts (for admin)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read announcements
CREATE POLICY "announcements_read_public" ON public.announcements
  FOR SELECT USING (true);

-- Allow authenticated users to create announcements (admin use)
CREATE POLICY "announcements_create_authenticated" ON public.announcements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update announcements (admin use)
CREATE POLICY "announcements_update_authenticated" ON public.announcements
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete announcements (admin use)
CREATE POLICY "announcements_delete_authenticated" ON public.announcements
  FOR DELETE USING (auth.role() = 'authenticated');

-- ====== Events: Similar to Announcements ======
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events
CREATE POLICY "events_read_public" ON public.events
  FOR SELECT USING (true);

-- Allow authenticated users to create/update/delete events (admin use)
CREATE POLICY "events_create_authenticated" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "events_update_authenticated" ON public.events
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "events_delete_authenticated" ON public.events
  FOR DELETE USING (auth.role() = 'authenticated');

-- ====== Timetables: Users can only manage their own ======
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Users can read their own timetables
CREATE POLICY "timetables_read_own" ON public.timetables
  FOR SELECT USING (auth.uid() = id OR auth.uid() = owner_uid);

-- Users can create their own timetables
CREATE POLICY "timetables_create_own" ON public.timetables
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own timetables
CREATE POLICY "timetables_update_own" ON public.timetables
  FOR UPDATE USING (auth.uid() = id OR auth.uid() = owner_uid) WITH CHECK (auth.uid() = id);

-- ====== Users: Users can read all, update their own ======
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can read user profiles
CREATE POLICY "users_read_all" ON public.users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ====== Notes: Users can only manage their own ======
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Users can read their own notes
CREATE POLICY "notes_read_own" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own notes
CREATE POLICY "notes_create_own" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "notes_delete_own" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- ====== Grades: Students read own, staff/admin manage all ======
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Students can read their own grades
CREATE POLICY "grades_read_own" ON public.grades
  FOR SELECT USING (auth.uid() = student_id);

-- Admins/staff can read all grades (adjust role check as needed)
CREATE POLICY "grades_read_staff" ON public.grades
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff')));

-- Admins/staff can create/update/delete grades
CREATE POLICY "grades_write_staff" ON public.grades
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff')));

CREATE POLICY "grades_update_staff" ON public.grades
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff')));

-- ====== Quick Fix: If announcements still not working ======
-- Run this to temporarily disable RLS on announcements:
-- ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
