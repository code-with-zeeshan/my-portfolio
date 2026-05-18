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
# SEO metadata (optional)
meta_title: "Custom SEO Title"     # Overrides default title
meta_description: "Custom description" # Overrides default description
og_image: "https://..."            # Custom OG image URL
# Scheduling (optional)
scheduled_for: "2026-05-01T00:00:00Z"  # Schedule post publication
---

Your content in Markdown/MDX here.
```

### Blog Search

The blog index now has a **search bar** that filters posts by:
- Title
- Description
- Tags

Works with both static MDX files and dynamic Supabase posts. No configuration needed — works automatically.

### Server-Side Contact Form

The contact form now submits via the `/api/contact` endpoint with:
- Server-side validation (email format, name length, message length)
- Per-email rate limiting (1 submission per minute) via Supabase
- Input sanitization (script tag removal)

No client-side `Supabase` dependency required for the form submission.

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
1. Admin → Projects tab → **+ Add Project** (added at top with sort_order: 1)
2. Fill in fields, upload image via Cloudinary drag & drop
3. Toggle **Featured on homepage** if desired
4. Click **Save**

### Reordering Content
In Profile tab, you can **drag & drop** to reorder:
- **Social Links** — Drag by the grip handle on the left to reorder
- **Highlights** — Drag by the grip handle on the left to reorder

In Projects, Skills, Experience, and Testimonials tabs:
- New items are added at the top with sort_order: 1
- Sort orders auto-adjust (1,2,3,4...) when adding or deleting items
- When deleting an item, remaining items automatically reindex

### Clickable Social Handles
In Profile tab's social links section, click on any social platform name (GitHub, LinkedIn, X, etc.) below to quickly add them as highlights.

### Clickable Icons
In Profile tab's highlights section, click on any icon name to add a new highlight with a smart default label (e.g., "trophy" → "Awards Won").

## Contact Page Quick Edit

The homepage contact section supports quick editing without the full admin panel:

### Access Methods
- **Keyboard:** Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) on the homepage
- After login, the contact form becomes editable

### What You Can Edit
- **Email** — Click on the label to edit (shown as "Email" with dropdown arrow)
- **Social Handles** — Up to 5 total items (email + 4 social handles), minimum 3
- **Platform Selection:** Click on any handle label (GitHub, LinkedIn, etc.) to open a dropdown and select a different platform
- **URLs:** Enter the full URL for each social handle (e.g., https://github.com/yourusername)

### Adding/Removing Handles
- At **3 items**: Only + button appears on the last handle
- At **4 items**: Both + and X buttons appear on the last handle
- At **5 items**: Only X button appears (maximum reached)
- When clicking X, the handle is removed; when clicking +, a new handle is added with the next available platform

### Save & Exit
- **Save Button:** Click to persist edit mode across page refreshes. Shows confirmation dialog when saved.
- **Exit Button:** Click to close edit mode. Prompts: "Stay Logged In" or "Logout & Exit"

### Display Format
Social handles display as @username (e.g., @code-with-zeeshan) instead of full URLs, with clickable links that open in a new tab.

All icons use the ReactIcon component for consistent rendering across all social platforms.

## Important Notes

1. **Always quote dates** in frontmatter: `"2026-04-01"` not `2026-04-01`
2. **Restart dev server** after adding/removing MDX files
3. **File names become slugs** — `first-post.mdx` → `/blog/first-post`
4. **Draft posts** are hidden from listings but accessible by direct URL in dev
5. **Image compression:** After adding new fallback images to `public/images/`, run `npm run compress:images` to optimize them at quality 70

## Blog Routing

Static MDX posts (`src/data/blog/*.mdx`) are served via `src/pages/blog/[...slug].astro`.
Dynamic Supabase posts are served via `src/pages/blog/[slug].astro` (SSR, `prerender = false`).

Both routes coexist — MDX posts use their file `id` as slug, Supabase posts use their `slug` field.

## Section Visibility

All portfolio sections can be toggled on/off via the **Settings** tab in the admin panel:
- **Projects** — Toggle visibility on homepage
- **Skills** — Toggle visibility on homepage and about page
- **Experience** — Toggle visibility on homepage and about page
- **Testimonials** — Toggle visibility on homepage and about page
- **Blog** — Toggle visibility on homepage

Changes are instant — no page refresh needed (uses localStorage + storage events).

## Use Static Data

In Settings tab, each section has a "Use Static Data" toggle. When enabled:
- Sync Static Data will only sync that specific section
- Useful for re-syncing individual sections without affecting others

This gives granular control over which sections get static data during sync.