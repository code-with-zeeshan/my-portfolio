// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "Unknown date";

  const d = date instanceof Date ? date : new Date(date);

  // Guard against Invalid Date
  if (isNaN(d.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function readingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Update a single item in an array by id, applying an updater function.
 * Returns a new array with the updated item replaced.
 */
export function updateItem<T extends { id: string }>(
  prev: T[],
  id: string,
  updater: (item: T) => T
): T[] {
  return prev.map((item) => (item.id === id ? updater(item) : item));
}

/**
 * Check if a Supabase auth session exists in localStorage.
 * Scans for keys containing "auth" paired with "supabase" or "sb-" prefix.
 */
export function hasAuthSession(): boolean {
  if (typeof window === "undefined") return false;
  return Object.keys(localStorage).some(
    (k) => k.includes("auth") && (k.startsWith("sb-") || k.includes("supabase"))
  );
}

/**
 * Generate a unique ID string.
 */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Extract GitHub username from a full URL.
 * e.g. "https://github.com/code-with-zeeshan" → "@code-with-zeeshan"
 */
export function extractGithubHandle(url: string | null | undefined): string {
  if (!url) return "@yourusername";
  return (
    "@" +
    url
      .replace(/https?:\/\/(www\.)?github\.com\//, "")
      .replace(/\/$/, "")
  );
}

/**
 * Extract LinkedIn username from a full URL.
 * e.g. "https://linkedin.com/in/mohammad-zeeshan-37637a1a5" → "mohammad-zeeshan-37637a1a5"
 */
export function extractLinkedinHandle(url: string | null | undefined): string {
  if (!url) return "yourusername";
  return (
    url
      .replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "")
      .replace(/\/$/, "")
  );
}

/**
 * Map static project data to the Supabase-shaped Project interface.
 * Used as fallback when Supabase is unreachable.
 */
export function mapStaticProject(p: {
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured: boolean;
  year?: string | null;
  outcome?: string | null;
  longDescription?: string | null;
  gallery_images?: string[];
  sortOrder?: number;
}, index: number): {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  year: string | null;
  outcome: string | null;
  sort_order: number;
  long_description: string | null;
  gallery_images: string[];
} {
  return {
    id: `static-${index}`,
    title: p.title,
    description: p.description,
    image_url: p.image,
    tags: p.tags,
    live_url: p.liveUrl ?? null,
    github_url: p.githubUrl ?? null,
    featured: p.featured,
    year: p.year ?? null,
    outcome: p.outcome ?? null,
    sort_order: p.sortOrder ?? index,
    long_description: p.longDescription ?? null,
    gallery_images: p.gallery_images ?? [],
  };
}

/**
 * Map static skill category data to the Supabase-shaped SkillCategory interface.
 */
export function mapStaticSkillCategory(s: {
  title: string;
  skills: string[];
}, index: number): {
  id: string;
  title: string;
  skills: string[];
  sort_order: number;
} {
  return {
    id: `static-${index}`,
    title: s.title,
    skills: s.skills,
    sort_order: index,
  };
}

/**
 * Map static experience data to the Supabase-shaped Experience interface.
 */
export function mapStaticExperience(e: {
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}, index: number): {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  sort_order: number;
} {
  return {
    id: `static-${index}`,
    company: e.company,
    role: e.role,
    period: e.period,
    description: e.description,
    achievements: e.achievements,
    sort_order: index,
  };
}