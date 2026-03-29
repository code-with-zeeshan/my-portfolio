// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// ─── Safe date parser that handles ALL formats ───
// YAML auto-parses "2026-03-28" into a Date object,
// quoted "2026-03-28" stays a string.
// This transformer handles BOTH cases safely.
const safeDate = z
  .union([z.date(), z.string()])
  .transform((val) => {
    const date = val instanceof Date ? val : new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${val}`);
    }
    return date;
  });

// ─── Blog Collection ─────────────────────────────────
const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/data/blog",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: safeDate,
    updatedDate: safeDate.optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// ─── Projects Collection ─────────────────────────────
const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/data/projects",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tags: z.array(z.string()),
    liveUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    pubDate: safeDate,
    featured: z.boolean().default(false),
  }),
});

// ─── Export ──────────────────────────────────────────
export const collections = { blog, projects };