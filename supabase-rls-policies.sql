-- ============================================
-- PORTFOLIO DATABASE SCHEMA - SINGLE SOURCE OF TRUTH
-- ============================================
-- This file contains all DDL, RLS, and storage policies for the portfolio Supabase project.
-- Run this file in Supabase SQL Editor to set up the entire database schema.
-- Avoid modifying this file directly; all changes should be version-controlled.

-- ============================================
-- CORE TABLE DEFINITIONS
-- ============================================

-- 1. PERSONAL INFO (single row — your profile)
CREATE TABLE IF NOT EXISTS personal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Open to opportunities',
  socials JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  year TEXT,
  outcome TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SKILLS
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0
);

-- 4. EXPERIENCE
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  achievements TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0
);

-- 5. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  hero_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  pub_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- 7. CONTACT MESSAGES (inbox)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RESUME METADATA
CREATE TABLE IF NOT EXISTS resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONTACT RATE LIMITS (per-email rate limiting for contact form)
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  email TEXT PRIMARY KEY,
  last_submission BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APP SETTINGS (key-value store for app metadata like rate limiting)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHEMA MIGRATIONS (ALTER TABLES)
-- ============================================

-- Add profile photo URL column to personal table
ALTER TABLE personal ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Migrate social links from flat columns to JSONB array (Phase 4)
ALTER TABLE personal ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '[]'::jsonb;

-- Backfill socials from old flat columns ONLY if they exist
-- First add temporary columns if they don't exist (will be dropped later)
DO $$
BEGIN
  -- Try to backfill only if columns exist (ignore errors if they don't)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personal' AND column_name = 'github_url') THEN
    UPDATE personal t
    SET socials = s.socials
    FROM (
      SELECT id, jsonb_agg(jsonb_build_object('platform', platform, 'url', url) ORDER BY platform) AS socials
      FROM (
        SELECT id, 'GitHub' AS platform, github_url AS url FROM personal WHERE github_url IS NOT NULL
        UNION ALL
        SELECT id, 'LinkedIn' AS platform, linkedin_url AS url FROM personal WHERE linkedin_url IS NOT NULL
        UNION ALL
        SELECT id, 'Twitter' AS platform, twitter_url AS url FROM personal WHERE twitter_url IS NOT NULL
      ) sub
      GROUP BY id
    ) s
    WHERE t.id = s.id
    AND t.socials = '[]'::jsonb;
  END IF;
END $$;

-- Remove old flat social URL columns (will silently succeed even if they don't exist)
ALTER TABLE personal DROP COLUMN IF EXISTS github_url;
ALTER TABLE personal DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE personal DROP COLUMN IF EXISTS twitter_url;

-- Add contact_socials column for contact section (separate from footer socials)
ALTER TABLE personal ADD COLUMN IF NOT EXISTS contact_socials JSONB DEFAULT '[{"platform": "GitHub", "url": "https://github.com/code-with-zeeshan"}, {"platform": "LinkedIn", "url": "https://linkedin.com/in/mohammad-zeeshan-37637a1a5"}]'::jsonb;

-- Add top_skills and highlights as JSONB columns on personal table
ALTER TABLE personal
  ADD COLUMN IF NOT EXISTS top_skills JSONB DEFAULT '[
    {"name": "React / Next.js", "level": 95},
    {"name": "TypeScript",       "level": 90},
    {"name": "Node.js",          "level": 85},
    {"name": "Tailwind CSS",     "level": 92},
    {"name": "PostgreSQL",       "level": 78}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[
    {"icon": "briefcase", "label": "Years Experience",   "value": "5+"},
    {"icon": "calendar",  "label": "Projects Completed", "value": "30+"},
    {"icon": "coffee",    "label": "Cups of Coffee",     "value": "∞"},
    {"icon": "heart",     "label": "Happy Clients",      "value": "20+"}
  ]'::jsonb;

-- Backfill existing personal rows with default top_skills and highlights if null
UPDATE personal
SET
  top_skills = '[
    {"name": "React / Next.js", "level": 95},
    {"name": "TypeScript",       "level": 90},
    {"name": "Node.js",          "level": 85},
    {"name": "Tailwind CSS",     "level": 92},
    {"name": "PostgreSQL",       "level": 78}
  ]'::jsonb,
  highlights = '[
    {"icon": "briefcase", "label": "Years Experience",   "value": "5+"},
    {"icon": "calendar",  "label": "Projects Completed", "value": "30+"},
    {"icon": "coffee",    "label": "Cups of Coffee",     "value": "∞"},
    {"icon": "heart",     "label": "Happy Clients",      "value": "20+"}
  ]'::jsonb
WHERE top_skills IS NULL OR highlights IS NULL;

-- Phase 3 Migrations
-- SEO fields for blog posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image         TEXT;

-- Scheduling for blog posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Project galleries
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Backfill gallery_images for existing project rows
UPDATE projects
SET gallery_images = '[]'::jsonb
WHERE gallery_images IS NULL;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER personal_updated_at BEFORE UPDATE ON personal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read personal" ON personal;
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "Public read skills" ON skill_categories;
DROP POLICY IF EXISTS "Public read experiences" ON experiences;
DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public read resume" ON resume;
DROP POLICY IF EXISTS "Public insert messages" ON messages;
DROP POLICY IF EXISTS "Admin full access personal" ON personal;
DROP POLICY IF EXISTS "Admin full access projects" ON projects;
DROP POLICY IF EXISTS "Admin full access skills" ON skill_categories;
DROP POLICY IF EXISTS "Admin full access experiences" ON experiences;
DROP POLICY IF EXISTS "Admin full access blog" ON blog_posts;
DROP POLICY IF EXISTS "Admin full access testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin full access messages" ON messages;
DROP POLICY IF EXISTS "Admin full access resume" ON resume;
DROP POLICY IF EXISTS "Admin full access contact_rate_limits" ON contact_rate_limits;
DROP POLICY IF EXISTS "Admin full access app_settings" ON app_settings;

-- PUBLIC READ policies (anyone can read published content)
CREATE POLICY "Public read personal" ON personal FOR SELECT TO anon USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Public read skills" ON skill_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT TO anon USING (true);
CREATE POLICY "Public read published posts" ON blog_posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT TO anon USING (true);
CREATE POLICY "Public read resume" ON resume FOR SELECT TO anon USING (true);

-- PUBLIC INSERT for messages (visitors can send contact messages)
CREATE POLICY "Public insert messages" ON messages FOR INSERT TO anon WITH CHECK (true);

-- ADMIN FULL ACCESS (authenticated users = you)
CREATE POLICY "Admin full access personal" ON personal FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access skills" ON skill_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access resume" ON resume FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contact_rate_limits" ON contact_rate_limits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access app_settings" ON app_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE POLICIES (portfolio-assets bucket)
-- ============================================
-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin update storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete storage" ON storage.objects;

-- Allow public to read files
CREATE POLICY "Public read storage"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'portfolio-assets');

-- Allow authenticated users to upload/update/delete
CREATE POLICY "Admin upload storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-assets' AND auth.role() = 'authenticated');

-- ============================================
-- SECURITY RECOMMENDATIONS
-- ============================================

-- 1. Enable RLS on all tables (done above)
-- 2. Use service role key ONLY on the server (AdminDashboard uses createAdminClient)
-- 3. Use anon key for client-side operations (public client respects RLS)
-- 4. Validate and sanitize all user inputs before database operations
-- 5. Implement rate limiting for public insert operations (e.g., contact form)
-- 6. contact_rate_limits table uses authenticated-only access (admin manages via API)
-- 6. Regularly audit RLS policies and access patterns
-- 7. Use Supabase's built-in auth for user authentication
-- 8. Never expose service role key in client-side code

-- ============================================
-- TESTING RLS POLICIES
-- ============================================

-- Test as anonymous user (public access):
-- SET ROLE anon;
-- SELECT * FROM projects;  -- Should only see published projects
-- SELECT * FROM messages;   -- Should fail (no SELECT permission)

-- Test as authenticated user:
-- SET ROLE authenticated;
-- SELECT * FROM projects;   -- Should see all projects
-- INSERT INTO messages ...; -- Should succeed

-- Reset role:
-- RESET ROLE;