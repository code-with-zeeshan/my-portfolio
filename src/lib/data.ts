// src/lib/data.ts
// Fetches data from Supabase, falls back to static data if unavailable
import { supabase } from "./supabase";
import type {
  PersonalInfo,
  Project,
  SkillCategory,
  Experience,
  BlogPost,
  Testimonial,
  Resume,
} from "./types";

// Import static data as fallbacks
import { personal as staticPersonal } from "@/data/personal";
import { projects as staticProjects } from "@/data/projects";
import { skillCategories as staticSkills } from "@/data/skills";
import { experiences as staticExperiences } from "@/data/experience";

// ─── Personal Info ───
export async function getPersonalInfo(): Promise<PersonalInfo | null> {
  try {
    const { data, error } = await supabase
      .from("personal")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) throw error;
    return data;
  } catch {
    // Fallback to static data
    return {
      id: "static",
      name: staticPersonal.name,
      title: staticPersonal.title,
      tagline: staticPersonal.tagline,
      bio: staticPersonal.bio,
      location: staticPersonal.location,
      email: staticPersonal.email,
      availability: staticPersonal.availability,
      github_url: staticPersonal.socials.github,
      linkedin_url: staticPersonal.socials.linkedin,
      twitter_url: staticPersonal.socials.twitter,
      profile_photo_url: staticPersonal.profilePhoto,
      top_skills: staticPersonal.topSkills.map((s) => ({
        name: s.name,
        level: s.level,
      })),
      highlights: staticPersonal.highlights.map((h) => ({
        icon: h.icon,
        label: h.label,
        value: h.value,
      })),
      updated_at: new Date().toISOString(),
    };
  }
}

// ─── Projects ───
export async function getProjects(featuredOnly = false): Promise<Project[]> {
  try {
    let query = supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (featuredOnly) query = query.eq("featured", true);

    const { data, error } = await query;
    if (error || !data?.length) throw error;
    return data;
  } catch {
    return staticProjects
      .filter((p) => !featuredOnly || p.featured)
      .map((p, i) => ({
        id: `static-${i}`,
        title: p.title,
        description: p.description,
        long_description: p.longDescription,
        image_url: p.image,
        tags: p.tags,
        live_url: p.liveUrl || null,
        github_url: p.githubUrl || null,
        featured: p.featured,
        year: p.year,
        outcome: p.outcome || null,
        sort_order: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
  }
}

// ─── Skills ───
export async function getSkillCategories(): Promise<SkillCategory[]> {
  try {
    const { data, error } = await supabase
      .from("skill_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) throw error;
    return data;
  } catch {
    return staticSkills.map((s, i) => ({
      id: `static-${i}`,
      title: s.title,
      skills: s.skills,
      sort_order: i,
    }));
  }
}

// ─── Experiences ───
export async function getExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) throw error;
    return data;
  } catch {
    return staticExperiences.map((e, i) => ({
      id: `static-${i}`,
      company: e.company,
      role: e.role,
      period: e.period,
      description: e.description,
      achievements: e.achievements,
      sort_order: i,
    }));
  }
}

// ─── Testimonials ───
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) throw error;
    return data;
  } catch {
    return [];
  }
}

// ─── Blog Posts ───
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("pub_date", { ascending: false });

    if (error || !data?.length) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) throw error;
    return data;
  } catch {
    return null;
  }
}

// ─── Resume ───
export async function getLatestResume(): Promise<Resume | null> {
  try {
    const { data, error } = await supabase
      .from("resume")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) throw error;
    return data;
  } catch {
    return null;
  }
}