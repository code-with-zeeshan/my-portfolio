// src/lib/settings.ts
import { createAdminClient } from "./supabase";

export interface SectionVisibility {
  projects: boolean;
  skills: boolean;
  experience: boolean;
  testimonials: boolean;
  blog: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  projects: true,
  skills: true,
  experience: true,
  testimonials: true,
  blog: true,
};

const SETTINGS_KEY = "section_visibility";

export async function getSectionVisibility(): Promise<SectionVisibility> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    if (error || !data) {
      return DEFAULT_VISIBILITY;
    }

    const stored = data.value as Partial<SectionVisibility>;
    return {
      projects: stored.projects ?? DEFAULT_VISIBILITY.projects,
      skills: stored.skills ?? DEFAULT_VISIBILITY.skills,
      experience: stored.experience ?? DEFAULT_VISIBILITY.experience,
      testimonials: stored.testimonials ?? DEFAULT_VISIBILITY.testimonials,
      blog: stored.blog ?? DEFAULT_VISIBILITY.blog,
    };
  } catch (err) {
    console.error("[Settings] Failed to get section visibility:", err);
    return DEFAULT_VISIBILITY;
  }
}

export async function updateSectionVisibility(
  updates: Partial<SectionVisibility>
): Promise<boolean> {
  try {
    const current = await getSectionVisibility();
    const updated = { ...current, ...updates };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        {
          key: SETTINGS_KEY,
          value: updated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("[Settings] Failed to update visibility:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Settings] Failed to update section visibility:", err);
    return false;
  }
}