# Content Management Guide

## How Content Works

This portfolio uses **Astro Content Collections** with the `glob` loader to manage blog posts and project case studies as MDX files.

### Content Configuration

**File:** `src/content.config.ts`

Defines schemas for `blog` and `projects` collections using Zod validation.

### Content Locations

| Content Type | Directory | Format |
|---|---|---|
| Blog posts | `src/data/blog/` | `.mdx` |
| Project case studies | `src/data/projects/` | `.mdx` |
| Personal info | `src/data/personal.ts` | TypeScript |
| Project list | `src/data/projects.ts` | TypeScript |
| Skills | `src/data/skills.ts` | TypeScript |
| Experience | `src/data/experience.ts` | TypeScript |

## Blog Post Frontmatter

```yaml
---
title: "Post Title"              # Required
description: "Summary"           # Required
pubDate: "2026-04-01"            # Required (quote the date!)
updatedDate: "2026-04-15"        # Optional
heroImage: "/images/blog/x.webp" # Optional
tags: ["Tag1", "Tag2"]           # Optional, defaults to []
draft: false                     # Optional, defaults to false
---
```

## Project Frontmatter

```yaml
---
title: "Project Name"                    # Required
description: "One-line summary"          # Required
image: "/images/projects/x.webp"         # Required
tags: ["React", "TypeScript"]            # Required
liveUrl: "https://demo.com"              # Optional
githubUrl: "https://github.com/you/x"   # Optional
pubDate: "2026-01-15"                    # Required (quote the date!)
featured: true                           # Optional, defaults to false
---
```

## Important Notes

1. **Always quote dates** in frontmatter: `pubDate: "2026-04-01"` not `pubDate: 2026-04-01`
2. **Restart dev server** after adding/removing MDX files
3. **File names become IDs** — `first-post.mdx` → URL `/blog/first-post`
4. **Draft posts** (`draft: true`) are hidden from listings but still accessible by direct URL in dev mode

## Updating Content Workflow

```bash
# 1. Edit/add files in src/data/
# 2. Check locally
npm run dev

# 3. Build to verify
npm run build

# 4. Deploy
git add .
git commit -m "content: add new blog post"
git push origin main
# Vercel auto-deploys
```