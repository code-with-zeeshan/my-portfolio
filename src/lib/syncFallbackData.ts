// src/lib/syncFallbackData.ts
import { createAdminClient } from "./supabase"; // use admin client, not public one
import { personal as staticPersonal } from "@/data/personal";
import { projects as staticProjects } from "@/data/projects";
import { skillCategories as staticSkills } from "@/data/skills";
import { experiences as staticExperiences } from "@/data/experience";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import type { CollectionEntry } from "astro:content";

export async function syncFallbackToSupabase(
  blogPosts: CollectionEntry<"blog">[],
  sections?: string[] | null
): Promise<{
  success: boolean;
  synced: string[];
  errors: string[];
}> {
  const synced: string[] = [];
  const errors: string[] = [];

  // Use admin client — bypasses RLS for server-side sync
  const supabase = createAdminClient();

  // Map section names to sync functions
  const shouldSync = (section: string) => !sections || sections.includes(section);

  // ─── 1. Sync Personal Info ───
  if (shouldSync("personal")) {
    try {
      const { data: existing } = await supabase.from("personal").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("personal").insert({
          name: staticPersonal.name,
          title: staticPersonal.title,
          tagline: staticPersonal.tagline,
          bio: staticPersonal.bio,
          location: staticPersonal.location,
          email: staticPersonal.email,
          availability: staticPersonal.availability,
          socials: staticPersonal.socials.map((s) => ({ ...s })),
        });
        if (error) errors.push(`Personal: ${error.message}`);
        else synced.push("Personal info");
      } else synced.push("Personal info (skipped)");
    } catch (e) { errors.push(`Personal: ${e}`); }
  }

  // ─── 2. Sync Projects ───
  if (shouldSync("projects")) {
    try {
      const { data: existing } = await supabase.from("projects").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("projects").insert(
          staticProjects.map((p, i) => ({
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
            sort_order: i + 1,
          }))
        );
        if (error) errors.push(`Projects: ${error.message}`);
        else synced.push(`${staticProjects.length} projects`);
      } else synced.push("Projects (skipped)");
    } catch (e) { errors.push(`Projects: ${e}`); }
  }

  // ─── 3. Sync Skills ───
  if (shouldSync("skills")) {
    try {
      const { data: existing } = await supabase.from("skill_categories").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("skill_categories").insert(
          staticSkills.map((s, i) => ({
            title: s.title,
            skills: s.skills,
            sort_order: i + 1,
          }))
        );
        if (error) errors.push(`Skills: ${error.message}`);
        else synced.push(`${staticSkills.length} skill categories`);
      } else synced.push("Skills (skipped)");
    } catch (e) { errors.push(`Skills: ${e}`); }
  }

  // ─── 4. Sync Experience ───
  if (shouldSync("experience")) {
    try {
      const { data: existing } = await supabase.from("experiences").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("experiences").insert(
          staticExperiences.map((e, i) => ({
            company: e.company,
            role: e.role,
            period: e.period,
            description: e.description,
            achievements: e.achievements,
            sort_order: i + 1,
          }))
        );
        if (error) errors.push(`Experience: ${error.message}`);
        else synced.push(`${staticExperiences.length} experiences`);
      } else synced.push("Experience (skipped)");
    } catch (e) { errors.push(`Experience: ${e}`); }
  }

  // ─── 5. Sync Testimonials ───
  if (shouldSync("testimonials")) {
    try {
      const { data: existing } = await supabase.from("testimonials").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("testimonials").insert(
          staticTestimonials.map((t, i) => ({
            name: t.name,
            role: t.role,
            company: t.company,
            content: t.content,
            sort_order: i + 1,
          }))
        );
        if (error) errors.push(`Testimonials: ${error.message}`);
        else synced.push(`${staticTestimonials.length} testimonials`);
      } else synced.push("Testimonials (skipped)");
    } catch (e) { errors.push(`Testimonials: ${e}`); }
  }

  // ─── 6. Sync Blog Posts ───
  if (shouldSync("blog")) {
    try {
      const { data: existing } = await supabase.from("blog_posts").select("id").limit(1).maybeSingle();
      if (!existing) {
        const { error } = await supabase.from("blog_posts").insert(
          blogPosts.map((p) => ({
            slug: p.id,
            title: p.data.title,
            description: p.data.description,
            content: p.body ?? "",
            hero_image: p.data.heroImage ?? null,
            published: !p.data.draft,
            pub_date: p.data.pubDate,
            tags: p.data.tags,
          }))
        );
        if (error) errors.push(`Blog: ${error.message}`);
        else synced.push(`${blogPosts.length} blog posts`);
      } else synced.push("Blog (already exists — skipped)");
    } catch (e) { errors.push(`Blog: ${e}`); }
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
  };
}