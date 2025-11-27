-- Add Courses table to Smart-Campus-Companion
-- Run this in your Supabase SQL editor to create the courses table

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  instructor text,
  credits integer,
  semester text,
  description text,
  dept text,
  created_at timestamptz DEFAULT now()
);

-- Student Enrollments (junction table)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON public.courses(dept);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON public.courses(semester);

-- Optional: Enable RLS if needed (uncomment to enable)
-- ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- INSERT sample courses (optional - remove if not needed)
INSERT INTO public.courses (code, name, instructor, credits, semester, description, dept) 
VALUES 
  ('CSE101', 'Introduction to Computer Science', 'Dr. Smith', 3, 'Fall 2024', 'Fundamentals of CS', 'CSE'),
  ('CSE201', 'Data Structures', 'Prof. Johnson', 4, 'Spring 2025', 'Learn about arrays, linked lists, trees', 'CSE'),
  ('ECE101', 'Basic Electronics', 'Dr. Lee', 3, 'Fall 2024', 'Introduction to circuits', 'ECE'),
  ('ME101', 'Mechanics I', 'Prof. Williams', 3, 'Fall 2024', 'Classical mechanics fundamentals', 'ME')
ON CONFLICT (code) DO NOTHING;
