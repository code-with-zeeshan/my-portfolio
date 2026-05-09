# AI Portfolio Setup Guide

This file contains all the information an AI agent needs to set up and deploy this portfolio for a new user.

## 🔧 USER CONFIGURATION SECTION

**Fill in the following details before asking the AI agent to set up your portfolio:**

```yaml
# ── Personal Information ──
PERSONAL:
  name: "Your Name"
  title: "Your Title (e.g., Full-Stack Developer)"
  tagline: "Your tagline (e.g., I craft modern web experiences)"
  bio: "Your bio (2-3 sentences about yourself)"
  location: "Your City, Country"
  email: "your.email@example.com"
  availability: "Open to opportunities" # or "Freelance available", "Not available", etc.
  
  # Social Links
  github_url: "https://github.com/yourusername"
  linkedin_url: "https://linkedin.com/in/yourusername"
  twitter_url: "https://twitter.com/yourusername" # Optional
  
  # Profile Photo (upload to Cloudinary or place in public/images/)
  profile_photo_url: "https://res.cloudinary.com/your-cloud-name/image/upload/your-profile.jpg"
  
  # Top Skills (name and proficiency 0-100)
  top_skills:
    - name: "React"
      level: 95
    - name: "TypeScript"
      level: 90
    - name: "Node.js"
      level: 85
  
  # Highlights (icons: briefcase, calendar, coffee, heart, etc.)
  highlights:
    - icon: "briefcase"
      label: "Years Experience"
      value: "5+"
    - icon: "calendar"
      label: "Projects Completed"
      value: "30+"

# ── Credentials (to be provided securely to AI agent) ──
CREDENTIALS:
  # Supabase (https://supabase.com)
  SUPABASE_URL: "https://xxxxx.supabase.co"
  SUPABASE_ANON_KEY: "eyJhbGciOi..."  # Public anon key
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOi..."  # Service role key (keep secret!)
  
  # Cloudinary (https://cloudinary.com)
  CLOUDINARY_CLOUD_NAME: "your_cloud_name"
  CLOUDINARY_API_KEY: "your_api_key"
  # Note: CLOUDINARY_UPLOAD_PRESET is "portfolio_unsigned" (already configured)
  
  # Cron Secret (generate with: openssl rand -hex 32)
  CRON_SECRET: "your_random_secret_string"
  
  # CSRF Secret (generate with: openssl rand -hex 32)
  CSRF_SECRET: "your_random_csrf_secret"

# ── Site Configuration ──
SITE:
  url: "https://yourdomain.com"  # Or your Vercel app URL temporarily
  analytics_provider: "vercel"  # Options: vercel, plausible, posthog, umami, none
  
  # Plausible (if using)
  PLAUSIBLE_DOMAIN: "yourdomain.com"
  PLAUSIBLE_API_KEY: "your_plausible_api_key"
  PLAUSIBLE_API_HOST: ""  # Leave empty for cloud, or set for self-hosted
  
  # Umami (if using)
  UMAMI_WEBSITE_ID: "your_website_id"
  UMAMI_URL: "https://umami.example.com"
  
  # PostHog (if using)
  # No additional config needed, just set analytics_provider to "posthog"

# ── Admin Configuration ──
ADMIN:
  email: "your.admin@email.com"  # Email for admin access (Ctrl+Shift+A)
  # Optional: restrict admin to specific email
  ADMIN_EMAIL: "your.admin@email.com"

# ── Projects (add as many as you want) ──
PROJECTS:
  - title: "Project Name"
    description: "Short description"
    longDescription: "Detailed description of the project, challenges, solutions..."
    tags: ["React", "TypeScript", "Node.js"]
    liveUrl: "https://project-live-url.com"  # Optional
    githubUrl: "https://github.com/you/project"  # Optional
    featured: true  # Show on homepage
    year: "2025"
    outcome: "Increased performance by 50%"
    image: "/images/projects/project-name.webp"  # Place in public/images/projects/

# ── Blog Posts (add as many as you want) ──
BLOG_POSTS:
  - title: "Blog Post Title"
    description: "Post description"
    pubDate: "2025-01-15"
    tags: ["Web Development", "React"]
    heroImage: ""  # Optional, Cloudinary URL or local path
    draft: false  # Set to true to hide from public
    content: |
      # Your Blog Post Content
      Write in Markdown format...

# ── Experience ──
EXPERIENCE:
  - company: "Company Name"
    role: "Your Role"
    period: "2023 — Present"
    description: "Description of your role"
    achievements:
      - "Achievement 1"
      - "Achievement 2"

# ── Skills ──
SKILLS:
  - title: "Frontend"
    skills: ["React", "TypeScript", "Tailwind CSS"]
  - title: "Backend"
    skills: ["Node.js", "PostgreSQL", "Python"]

# ── Testimonials ──
TESTIMONIALS:
  - name: "Person Name"
    role: "Their Role"
    company: "Their Company"
    content: "Testimonial content..."
```

> **💡 Note:** Filling in the USER CONFIGURATION SECTION is OPTIONAL! 
> If you don't provide these details now, you can easily edit ALL of them later through the **Admin Dashboard**:
> - Press `Ctrl+Shift+A` on your deployed site to open the Admin Login
> - Log in with your admin credentials
> - Use the dashboard to edit: Personal info, Projects, Blog posts, Experience, Skills, Testimonials, and more!
> - No coding required - everything can be done through the user-friendly admin interface

---

## 🤖 INSTRUCTIONS FOR AI AGENTS

Follow these steps in order to set up the portfolio for the user.

### Step 1: Prerequisites Check

Ensure the user has:
- Node.js 22.12.0+ installed
- Git installed
- Accounts created at:
  - [Supabase](https://supabase.com) (free tier)
  - [Cloudinary](https://cloudinary.com) (free tier)
  - [Vercel](https://vercel.com) (free tier, sign in with GitHub)

### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# Install dependencies
npm install
```

### Step 3: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → New Project
2. Enter project details (name, password, region)
3. Wait for project to be ready (2-3 minutes)
4. Go to **SQL Editor** in Supabase dashboard
5. Copy the entire contents of `supabase-rls-policies.sql` and run it
   - This creates all tables, RLS policies, and storage policies
6. Go to **Authentication → Users** → Add user
   - Email: Use the `ADMIN_EMAIL` from user config
   - Password: Generate a secure password
   - This is the admin login for the portfolio
7. Go to **Settings → API**
   - Copy `Project URL` → Set as `SUPABASE_URL`
   - Copy `anon public` key → Set as `SUPABASE_ANON_KEY`
   - Copy `service_role` key → Set as `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. From **Dashboard** copy your `Cloud Name` → Set as `CLOUDINARY_CLOUD_NAME`
3. Go to **Programmable Image Media → Settings → Upload**
4. Click **Upload Presets** → **Add Upload Preset**
   - Preset Name: `portfolio_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `portfolio`
   - Unique filename: ✅ Enabled
5. Go to **Settings → Security** → Copy **API Key** → Set as `CLOUDINARY_API_KEY`

### Step 5: Configure Environment Variables

Create `.env` file from example:

```bash
cp .env.example .env
```

Fill in `.env` with values from the **USER CONFIGURATION SECTION** above:

```env
# Site URL
PUBLIC_SITE_URL=https://yourdomain.com

# Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
PUBLIC_CLOUDINARY_API_KEY=your_api_key

# Security
CRON_SECRET=your_random_secret_string
CSRF_SECRET=your_random_csrf_secret

# Admin
ADMIN_EMAIL=your.admin@email.com

# Analytics (optional)
PUBLIC_ANALYTICS_PROVIDER=vercel
# Fill these only if using Plausible/Umami:
# PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
# PUBLIC_PLAUSIBLE_API_KEY=your_key
# PUBLIC_UMAMI_WEBSITE_ID=your_id
# PUBLIC_UMAMI_URL=https://umami.example.com
```

### Step 6: Update Personal Information

Update `src/data/personal.ts` with user's information:

```typescript
// src/data/personal.ts
export const personal = {
  name: "User's Name",
  title: "User's Title",
  tagline: "User's tagline",
  bio: "User's bio",
  location: "User's location",
  email: "user@email.com",
  availability: "Open to opportunities",
  socials: {
    github: "https://github.com/username",
    linkedin: "https://linkedin.com/in/username",
    twitter: "https://twitter.com/username",
  },
  profilePhoto: "/images/profile.webp", // Upload to Cloudinary
  topSkills: [
    { name: "Skill 1", level: 95 },
    { name: "Skill 2", level: 90 },
  ],
  highlights: [
    { icon: "briefcase", label: "Years Experience", value: "X+" },
    { icon: "calendar", label: "Projects", value: "X+" },
  ],
} as const;
```

### Step 7: Add Projects

Option A: Update `src/data/projects.ts` for static fallback:

```typescript
// src/data/projects.ts
export const projects: Project[] = [
  {
    title: "Project Name",
    description: "Description",
    longDescription: "Detailed description...",
    image: "/images/projects/project.webp",
    tags: ["React", "TypeScript"],
    liveUrl: "https://...",
    githubUrl: "https://...",
    featured: true,
    year: "2025",
    outcome: "Result achieved",
    gallery_images: undefined,
    sortOrder: 0
  },
];
```

Option B: Use Admin Dashboard after deployment (recommended)

### Step 8: Add Blog Posts

Create MDX files in `src/data/blog/`:

```mdx
---
title: "Your Blog Post Title"
description: "Post description"
pubDate: "2025-01-15"
tags: ["Web Development", "React"]
heroImage: ""
draft: false
---

# Your Blog Post Title

Content in Markdown format...
```

### Step 9: Update Experience, Skills, Testimonials

Edit these files:
- `src/data/experience.ts` - Work experience
- `src/data/skills.ts` - Skill categories
- `src/data/testimonials.ts` - Client testimonials

### Step 10: Optimize Images

Compress fallback images to reduce download size:

```bash
npm run compress:images
```

This uses Sharp to compress images at quality 70. Typical savings: **~70% reduction** on uncompressed PNGs (especially the 512×512 manifest icon).

### Step 11: Test Locally

```bash
npm run dev
# Open http://localhost:4321
```

Verify:
- [ ] Site loads correctly
- [ ] Dark mode toggle works
- [ ] All sections display
- [ ] Press `Ctrl+Shift+A` → Login with admin credentials
- [ ] Admin dashboard loads

### Step 12: Deploy to Vercel

```bash
git add .
git commit -m "Initial portfolio setup"
git push origin main
```

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New Project** → Select `my-portfolio` repo
3. Vercel auto-detects Astro → Click **Deploy**
4. Go to **Settings → Environment Variables**
5. Add ALL variables from `.env` file
   - Set for: Production, Preview, Development
6. Redeploy if needed

### Step 13: Post-Deployment Setup

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Press `Ctrl+Shift+A` → Login with admin credentials
3. In Admin Dashboard:
   - Click **Sync Static Data** to import `src/data/*.ts` to Supabase
   - Add projects, blog posts via the UI
   - Upload images via Cloudinary integration
   - Upload resume PDF

### Step 14: Custom Domain (Optional)

1. Purchase domain (Namecheap, Cloudflare, Porkbun)
2. Vercel → Project → Settings → Domains → **Add Domain**
3. Follow DNS instructions (A record or CNAME)
4. Update `PUBLIC_SITE_URL` in Vercel environment variables
5. Redeploy

---

## 📋 Verification Checklist

After deployment, verify:

- [ ] Site loads at custom domain or Vercel URL
- [ ] HTTPS is working (Vercel provides free SSL)
- [ ] Dark/light mode toggle works and persists
- [ ] All navigation links work
- [ ] `Ctrl+Shift+A` opens admin login
- [ ] Admin dashboard accessible after login
- [ ] Contact form submits successfully
- [ ] Messages appear in Admin → Messages
- [ ] Blog posts display correctly
- [ ] Project pages load
- [ ] Images load from Cloudinary
- [ ] Mobile layout is responsive
- [ ] OG image preview works (test at [opengraph.xyz](https://opengraph.xyz))
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Analytics tracking (if configured)
- [ ] Run `npm run compress:images` to optimize fallback images

---

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **`SUPABASE_SERVICE_ROLE_KEY`** - Server-only, never exposed to browser
3. **`CRON_SECRET` and `CSRF_SECRET`** - Generate random strings, keep secret
4. **Admin access** - Protected by Supabase Auth + `ADMIN_EMAIL` check
5. **RLS Policies** - Database access restricted by Row Level Security
6. **CSP Headers** - Content Security Policy set in `src/middleware.ts`

---

## 📚 Additional Documentation

- [README.md](README.md) - Project overview and features
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) - Customization options
- [docs/ADMIN.md](docs/ADMIN.md) - Admin panel usage
- [supabase-rls-policies.sql](supabase-rls-policies.sql) - Database schema

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|-----------|
| `npm install` fails | Ensure Node.js 22+ is installed |
| Styles not loading | Clear cache: `rm -rf .astro node_modules/.vite && npm run dev` |
| Admin login fails | Check Supabase credentials in `.env` |
| Images not loading | Verify `PUBLIC_CLOUDINARY_CLOUD_NAME` is correct |
| Sync fails | Check `SUPABASE_SERVICE_ROLE_KEY` (no `PUBLIC_` prefix) |
| Build fails on Vercel | Check all environment variables are set |
| Scheduled posts not publishing | Verify `CRON_SECRET` matches in env and Vercel |

---

**For AI Agents:** When user provides their configuration details, follow the steps above in order. Ask for any missing information before proceeding. All credentials should be handled securely and never logged or exposed.
