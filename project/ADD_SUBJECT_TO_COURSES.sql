-- Migration: add `subject` column to courses and update sample data
-- Run this in your Supabase SQL editor (or psql) for the project's DB.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS subject text;

-- Update existing sample rows by course code (adjust as needed)
UPDATE public.courses
SET subject = 'Fundamentals'
WHERE code = 'CSE101';

UPDATE public.courses
SET subject = 'Algorithms & Data Structures'
WHERE code = 'CSE201';

UPDATE public.courses
SET subject = 'Electronics'
WHERE code = 'ECE101';

UPDATE public.courses
SET subject = 'Mechanics'
WHERE code = 'ME101';

-- Optional: verify results
-- SELECT id, code, name, subject FROM public.courses ORDER BY code;
