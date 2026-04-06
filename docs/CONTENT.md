# Content Management Guide

## Two Ways to Manage Content

| Method | Best For | How |
|---|---|---|
| **Admin Panel** | Quick edits, new blog posts, updating projects | `Ctrl+Shift+A` → login |
| **Static files** | Initial setup, version-controlled content | Edit `src/data/*.ts` + MDX files |

Both methods are always available. Static files serve as fallback if Supabase is unreachable.

## Static Data Files

| File | Content |
|---|---|
| `src/data/personal.ts` | Name, bio, title, location, email, social links |
| `src/data/projects.ts` | Project list with descriptions, tags, URLs |
| `src/data/skills.ts` | Skill categories and technology tags |
| `src/data/experience.ts` | Work history, roles, achievements |
| `src/data/testimonials.ts` | Client/colleague testimonials |

## MDX Content Files

| Directory | Content | URL Pattern |
|---|---|---|
| `src/data/blog/` | Blog posts | `/blog/[filename]` |
| `src/data/projects/` | Project case studies | Rendered via `[...slug].astro` |

## Blog Post Frontmatter

```yaml
---
title: "Post Title"              # Required
description: "SEO summary"       # Required
pubDate: "2026-04-01"            # Required — always quote the date!
updatedDate: "2026-04-15"        # Optional
heroImage: ""                    # Optional — Cloudinary URL or local path
tags: ["Tag1", "Tag2"]           # Optional, defaults to []
draft: false                     # Optional — true hides from listings
---

Your content in Markdown/MDX here.
```

## Project MDX Frontmatter

```yaml
---
title: "Project Name"
description: "One-line summary"
image: "/images/projects/x.webp"
tags: ["React", "TypeScript"]
liveUrl: "https://demo.com"      # Optional
githubUrl: "https://github.com/you/x"  # Optional
pubDate: "2026-01-15"            # Always quote!
featured: true                   # Shows on homepage
---
```

## Adding Content via Admin

### New Blog Post
1. `Ctrl+Shift+A` → Blog tab → **+ New Post**
2. Fill in title, description, slug, tags, content (Markdown)
3. Toggle **Published** when ready
4. Click **Save**

### New Project
1. Admin → Projects tab → **+ Add Project**
2. Fill in fields, upload image via Cloudinary drag & drop
3. Toggle **Featured on homepage** if desired
4. Click **Save**

## Important Notes

1. **Always quote dates** in frontmatter: `"2026-04-01"` not `2026-04-01`
2. **Restart dev server** after adding/removing MDX files
3. **File names become slugs** — `first-post.mdx` → `/blog/first-post`
4. **Draft posts** are hidden from listings but accessible by direct URL in dev

## Blog Routing

Static MDX posts (`src/data/blog/*.mdx`) are served via `src/pages/blog/[...slug].astro`.
Dynamic Supabase posts are served via `src/pages/blog/[slug].astro` (SSR, `prerender = false`).

Both routes coexist — MDX posts use their file `id` as slug, Supabase posts use their `slug` field.