# Customization Guide

## Quick Start — What to Change First

### 1. Personal Information

**File:** `src/data/personal.ts`

Replace ALL placeholder values:

```typescript
export const personal = {
  name: "Your Real Name",        // ← Change
  title: "Your Job Title",       // ← Change
  tagline: "Your tagline.",      // ← Change
  bio: "Your bio paragraph.",    // ← Change
  location: "City, Country",     // ← Change
  email: "real@email.com",       // ← Change
  availability: "Open to work",  // ← Change
  socials: {
    github: "https://github.com/YOU",       // ← Change
    linkedin: "https://linkedin.com/in/YOU", // ← Change
    twitter: "https://x.com/YOU",            // ← Change
  },
};
```

### 2. Projects

**File:** `src/data/projects.ts`

Replace sample projects with your real work. Each project needs:

- `title` — Project name
- `description` — One-line summary
- `longDescription` — Detailed description
- `image` — Screenshot path (add to `public/images/projects/`)
- `tags` — Technologies used
- `liveUrl` — Live demo link (optional)
- `githubUrl` — Source code link (optional)
- `outcome` — Measurable result ("Increased X by Y%")
- `featured` — `true` to show on homepage

### 3. Skills

**File:** `src/data/skills.ts`

Update skill categories and individual skills to match yours.

### 4. Work Experience

**File:** `src/data/experience.ts`

Replace with your actual work history.

### 5. Images

| Image | Location | Size |
|---|---|---|
| Profile photo | `public/images/profile.webp` | Square, min 600×600px |
| Project screenshots | `public/images/projects/*.webp` | 16:9 ratio, min 1200×675px |
| OG Image | `public/og-image.png` | Exactly 1200×630px |
| Favicon | `public/favicon.svg` | SVG format |
| Resume | `public/resume.pdf` | PDF format |

### 6. Site URL

**File:** `astro.config.mjs`

```javascript
site: "https://yourdomain.com",  // ← Your real domain
```

### 7. Branding in Templates

Search and replace across these files:

| Find | Replace With | Files |
|---|---|---|
| `YN.` | Your initials + `.` | `Header.astro`, `Footer.astro` |
| `Your Name` | Your real name | `BaseLayout.astro`, `Footer.astro` |
| `yourusername` | Your GitHub username | All social links |

## Adding Blog Posts

Create a new `.mdx` file in `src/data/blog/`:

```mdx
---
title: "Post Title"
description: "Brief summary for SEO and previews."
pubDate: "2026-04-15"
tags: ["Tag1", "Tag2"]
heroImage: "/images/blog/post-image.webp"
draft: false
---

Write your content using Markdown syntax.

## Subheading

Regular paragraph text with **bold** and *italic*.

- Bullet list
- Another item

```javascript
// Code blocks with syntax highlighting
const greeting = "Hello, World!";
```
```

## Adding Project Case Studies

Create a new `.mdx` file in `src/data/projects/`:

```mdx
---
title: "Project Name"
description: "One-line project summary."
image: "/images/projects/project-name.webp"
tags: ["React", "Node.js"]
liveUrl: "https://project-demo.com"
githubUrl: "https://github.com/you/project"
pubDate: "2026-03-01"
featured: true
---

# Project Name

## The Challenge
What problem did this solve?

## My Role
What did you specifically do?

## Results
- **Metric 1:** X% improvement
- **Metric 2:** Y users served
```

## Changing Colors

**File:** `src/styles/global.css`

The brand color is defined in OKLCH color space. Change the hue value:

```css
--color-brand-500: oklch(0.60 0.16 HUE);
```

| Hue | Color | Example |
|---|---|---|
| 260 | Purple/Indigo | Default |
| 220 | Blue | Tech/Corporate |
| 160 | Green/Teal | Nature/Growth |
| 30 | Orange/Amber | Creative/Warm |
| 350 | Pink/Rose | Bold/Modern |
| 0 | Red | Passionate |