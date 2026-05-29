# Content Management Guide

## Two Ways to Manage Content

| Method | Best For | How |
|---|---|---|
| **Admin Panel** | Quick edits, new blog posts, updating projects | `Ctrl+Shift+A` → login |
| **Static Files** | Initial setup, version-controlled content | Edit `src/data/*.ts` + MDX files |

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
| `src/data/projects/` | Project case studies | `/projects/[id]` |

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
# SEO metadata
meta_title: "Custom SEO Title"     # Overrides default title
meta_description: "Custom description" # Overrides default description
og_image: "https://..."            # Custom OG image URL
# Scheduling
scheduled_for: "2026-05-01T00:00:00Z"  # Schedule post publication
---

Your content in Markdown/MDX here.
```

### Blog Search

The blog index has a **search bar** that filters posts by:
- Title
- Description
- Tags

Works with both static MDX files and dynamic Supabase posts automatically.

### Server-Side Contact Form

The contact form submits via `/api/contact` with:
- Server-side validation (email format, name/message length)
- Per-email rate limiting (1 submission per minute) via Supabase
- Input sanitization (script tag removal)

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
2. Fill in fields: title, description (use the Markdown editor via "Expand editor"), tags, URLs
3. **Video Gallery**: Upload MP4, WebM, or GIF files via drag-and-drop (Cloudinary) — supports multiple videos
4. Upload image via Cloudinary drag & drop
5. Toggle **Featured on homepage** if desired
6. Click **Save**

### Project Videos

Projects support video demos via the **Videos** section:
- Drag-and-drop upload area for MP4, WebM, GIF files
- Multiple videos supported — shown as a gallery on project detail pages
- A "Video" badge appears on project cards that have videos
- Video thumbnails show with HTML5 `<video>` controls
- Works alongside the main project image and image gallery

## Reordering Content

### Profile Tab
- **Social Links**: Drag by the grip handle on the left to reorder — these appear in the website **footer**
- **Contact Information**: Drag by the grip handle on the left to reorder — these appear on the **Contact page**
- **Highlights**: Drag by the grip handle on the left to reorder

### Projects, Skills, Experience, Testimonials
- New items added at top with sort_order: 1
- Sort orders auto-adjust (1,2,3,4...) when adding or deleting
- When deleting, remaining items automatically reindex

## Clickable Features

### Clickable Social Handles
In Profile tab's social links section, click on any social platform name (GitHub, LinkedIn, X, etc.) to quickly add them as highlights.

### Clickable Icons
In Profile tab's highlights section, click on any icon name to add a new highlight with a smart default label (e.g., "trophy" → "Awards Won").

## Contact Page Quick Edit

Edit contact info directly on the homepage without opening the full admin panel:

### Access
- Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) on the homepage
- After login, the contact section becomes editable

### What You Can Edit
- **Email**: Click on the label to edit (shown as "Email" with dropdown)
- **Social Handles**: 3-5 total items (email + 2-4 social handles)
- **Platform Selection**: Click on any handle label to open dropdown and select different platform
- **URLs**: Enter full URL for each social handle

### Adding/Removing Handles
- At **3 items**: Only + button appears on the last handle
- At **4 items**: Both + and X buttons appear
- At **5 items**: Only X button (maximum reached)

### Save & Exit
- **Save Button**: Persists edit mode across page refreshes
- **Exit Button**: Closes edit mode with option to "Stay Logged In" or "Logout & Exit"

### Display Format
Social handles display as @username (e.g., @code-with-zeeshan) instead of full URLs, with clickable links opening in a new tab.

> 💡 All icons use ReactIcon component for consistent rendering.

## Contact Information vs Social Links

The portfolio has two separate sets of social handles with different placements:

| Section | Location in Admin | Where It Displays | Best For |
|---|---|---|---|
| **Social Links** | Profile tab → Social Links section | Website **footer** (visible on every page) | General social profiles you want always visible |
| **Contact Information** | Profile tab → Contact Information section | **Contact page** only | Additional handles specific to reaching you (Email, LinkedIn, etc.) |
| **Quick Edit (Ctrl+Shift+C)** | Floating edit mode on homepage | Contact page only | Quick on-the-fly changes without opening admin |

**When to use which:**
- Use **Social Links** for profiles visitors see site-wide (GitHub, LinkedIn, X, etc.)
- Use **Contact Information** for handles shown only on the Contact page (can include the same platforms or different ones)
- Use **Ctrl+Shift+C** for quick edits to Contact Information without navigating to the admin panel

## Important Notes

1. **Always quote dates** in frontmatter: `"2026-04-01"` not `2026-04-01`
2. **Restart dev server** after adding/removing MDX files
3. **File names become slugs** — `first-post.mdx` → `/blog/first-post`
4. **Draft posts** hidden from listings but accessible by direct URL in dev
5. **Image compression**: After adding fallback images, run `npm run compress:images`

## Blog Routing

| Source | Route File | Mode |
|---|---|---|
| Static MDX | `src/pages/blog/[...slug].astro` | Static |
| Dynamic Supabase | `src/pages/blog/[slug].astro` | SSR (`prerender = false`) |

Both coexist — MDX uses file `id` as slug, Supabase uses `slug` field.

## Section Visibility

All sections can be toggled on/off via **Settings** tab:
- **Projects** — Toggle on homepage
- **Skills** — Toggle on homepage and about page
- **Experience** — Toggle on homepage and about page
- **Testimonials** — Toggle on homepage and about page
- **Blog** — Toggle on homepage

Changes are instant — no page refresh needed (uses localStorage + storage events).

## Use Static Data

In Settings tab, each section has a "Use Static Data" toggle:
- When enabled, Sync Static Data only syncs that specific section
- Useful for re-syncing individual sections without affecting others