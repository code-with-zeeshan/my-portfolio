// src/lib/types.ts
// Database types matching the Supabase schema

export interface TopSkill {
  name: string;
  level: number; // 0-100
}

export interface Highlight {
  icon: string;  // matches ReactIcon name keys
  label: string;
  value: string;
}

export interface PersonalInfo {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  availability: string;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  profile_photo_url?: string | null;
  top_skills: TopSkill[];
  highlights: Highlight[];
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  year: string | null;
  outcome: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  sort_order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  sort_order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  hero_image: string | null;
  published: boolean;
  pub_date: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  sort_order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Resume {
  id: string;
  file_url: string;
  filename: string;
  uploaded_at: string;
}