-- ==============================================================================
-- LATHALA STUDIO — SUPABASE DATABASE INITIALIZATION SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Instance: https://vvjsesddnbsledhwoczp.supabase.co
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table (Canvas Designs, Dimensions, Elements State)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default-user',
    title TEXT NOT NULL DEFAULT 'Untitled Dispatch',
    segment_id TEXT DEFAULT 'all',
    folder TEXT DEFAULT NULL,
    is_starred BOOLEAN DEFAULT FALSE,
    artboard_width INTEGER NOT NULL DEFAULT 600,
    artboard_height INTEGER NOT NULL DEFAULT 880,
    artboard_background TEXT NOT NULL DEFAULT '#F1EEE9',
    artboard_border_radius INTEGER NOT NULL DEFAULT 0,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Departments Table (Audience Segments & Routing)
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default-user',
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#B4552D',
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscribers / Audience CRM Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default-user',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Subscriber',
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'bounced'
    last_sent_at TIMESTAMPTZ DEFAULT NULL,
    custom_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Folders Table
CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default-user',
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#D97706',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Custom CRM Columns Table
CREATE TABLE IF NOT EXISTS public.custom_columns (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default-user',
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_edited_at ON public.projects (edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers (user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_dept ON public.subscribers (department_id);
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON public.departments (user_id);

-- 8. Row Level Security (RLS) Setup
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_columns ENABLE ROW LEVEL SECURITY;

-- 9. Open Permissive BYOK Policies for Web Studio (Anon Key or Authenticated User)
CREATE POLICY "Allow anon and auth read on projects" ON public.projects
    FOR SELECT USING (true);
CREATE POLICY "Allow anon and auth insert on projects" ON public.projects
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon and auth update on projects" ON public.projects
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon and auth delete on projects" ON public.projects
    FOR DELETE USING (true);

CREATE POLICY "Allow anon and auth read on subscribers" ON public.subscribers
    FOR SELECT USING (true);
CREATE POLICY "Allow anon and auth insert on subscribers" ON public.subscribers
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon and auth update on subscribers" ON public.subscribers
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon and auth delete on subscribers" ON public.subscribers
    FOR DELETE USING (true);

CREATE POLICY "Allow anon and auth read on departments" ON public.departments
    FOR SELECT USING (true);
CREATE POLICY "Allow anon and auth insert on departments" ON public.departments
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon and auth update on departments" ON public.departments
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon and auth delete on departments" ON public.departments
    FOR DELETE USING (true);

CREATE POLICY "Allow anon and auth read on folders" ON public.folders
    FOR SELECT USING (true);
CREATE POLICY "Allow anon and auth insert on folders" ON public.folders
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon and auth update on folders" ON public.folders
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon and auth delete on folders" ON public.folders
    FOR DELETE USING (true);

CREATE POLICY "Allow anon and auth read on custom_columns" ON public.custom_columns
    FOR SELECT USING (true);
CREATE POLICY "Allow anon and auth insert on custom_columns" ON public.custom_columns
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon and auth update on custom_columns" ON public.custom_columns
    FOR UPDATE USING (true);
CREATE POLICY "Allow anon and auth delete on custom_columns" ON public.custom_columns
    FOR DELETE USING (true);

-- 10. Seed Initial System Departments
INSERT INTO public.departments (id, user_id, name, color, description)
VALUES 
    ('dep-editorial', 'default-user', 'Editorial & Writers', '#B4552D', 'Writers, columnists, and research staff'),
    ('dep-studio', 'default-user', 'Studio Crafts & Ops', '#2F6F5E', 'Design production, print buyers, typography'),
    ('dep-patrons', 'default-user', 'Founding Patrons', '#5B4BB7', 'VIP subscribers, benefactors, early adopters'),
    ('dep-press', 'default-user', 'Press & Curators', '#A4762A', 'Journalists, art critics, cultural institutions'),
    ('dep-partners', 'default-user', 'Gallery Partners', '#0062FF', 'Retail galleries and institutional partners')
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 'Lathala schema initialized successfully!' AS status;
