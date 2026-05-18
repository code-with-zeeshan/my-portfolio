# AI Setup Guide

This file provides an AI agent with everything needed to understand the project architecture, set up all services, and deploy the portfolio for a user — using only the credentials provided below.

---

## 📋 USER CREDENTIALS SECTION

**Non-technical user provides these credentials. AI validates and uses them directly.**

### Supabase (Database & Auth)
- **Project URL**: `https://xxxxx.supabase.co`
- **API Key** (one of two formats accepted):
  - **Legacy format**: JWT tokens starting with `eyJ...` (from Settings → API → "Project API keys")
  - **New format**: `sb_publishable...` (anon) + `sb_secret...` (secret) (from Settings → API → "New API keys")
- **Admin Email**: `your-admin@email.com`
- **Admin Password**: `your-admin-password`

### Cloudinary (Image CDN)
- **Cloud Name**: `your-cloud-name`
- **API Key**: `your-api-key`
- **Upload Preset**: `portfolio_unsigned` (create this preset in Settings → Upload → Upload Presets)

### Site Configuration
- **Site URL**: `https://yourdomain.com`
- **Analytics Provider**: `vercel` | `plausible` | `posthog` | `umami` | `none`

### Security Secrets (generate if not provided)
- **CRON_SECRET**: `openssl rand -hex 32`
- **CSRF_SECRET**: `openssl rand -hex 32`

---

## 🏗️ PROJECT ARCHITECTURE

### Tech Stack
| Technology | Purpose |
|---|---|
| Astro 6 | Static site generator with island architecture |
| React 18 | Interactive UI components (client-side islands) |
| Tailwind CSS v4 | Styling framework |
| Supabase | PostgreSQL database + auth + storage |
| Cloudinary | Image CDN with auto-optimization |
| shadcn/ui | Accessible component library |
| Vercel | Deployment platform |

### Data Flow
```
Static Fallbacks (src/data/*.ts)
        ↓
Supabase Database (primary)
        ↓
Dynamic* React Components (fetch live data)
        ↓
Portfolio Pages (visitor-facing)
```

### Key Files
| File | Purpose |
|---|---|
| `src/components/react/sections/Dynamic*.tsx` | Sections that fetch from Supabase |
| `src/components/react/AdminDashboard.tsx` | Full CMS dashboard |
| `src/components/react/AdminGate.tsx` | Hidden login modal (`Ctrl+Shift+A`) |
| `src/components/react/ReactIcon.tsx` | SVG icon system (40+ icons) |
| `src/lib/supabase.ts` | Supabase client setup |
| `src/lib/data.ts` | Fetch helpers with fallback logic |

### Two SQL Files
| File | When to Use |
|---|---|
| `supabase-rls-policies-prod.sql` | Fresh Supabase project (all CREATE TABLE) |
| `supabase-rls-policies.sql` | Existing database (ALTER TABLE + migrations) |

### Two Icon Systems
| Component | File | Used In |
|---|---|---|
| `Icons.astro` | `src/components/ui/Icons.astro` | `.astro` files only (SSR-safe) |
| `ReactIcon.tsx` | `src/components/react/ReactIcon.tsx` | `.tsx` files only (React components) |

> ⚠️ Never import `Icons.astro` into a `.tsx` file — Astro components are server-only and cannot render in React.

---

## 🚀 DEPLOYMENT STEPS

### Phase 1: Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

### Phase 2: Supabase Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Run SQL** in SQL Editor:
   - Copy entire content from `supabase-rls-policies-prod.sql`
   - Paste and run
3. **Create storage bucket**:
   - Go to Storage → New Bucket
   - Name: `portfolio-assets`
   - ✅ Make public
4. **Create admin user**:
   - Go to Authentication → Users → Add user
   - Email: use from USER CREDENTIALS
   - Password: use from USER CREDENTIALS
5. **Get API keys** (choose one format):
   - **Legacy**: Copy `anon public` key (starts with `eyJ...`) + `service_role` key (starts with `eyJ...`)
   - **New**: Copy `Publishable key` (starts with `sb_publishable...`) + `Secret key` (starts with `sb_secret...`)

### Phase 3: Cloudinary Setup

1. **Create Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Get cloud name** from Dashboard
3. **Create upload preset**:
   - Settings → Upload → Upload Presets → Add Upload Preset
   - Name: `portfolio_unsigned`
   - Signing Mode: Unsigned
   - Folder: `portfolio`
   - Unique filename: ✅ Enabled
4. **Get API key**: Settings → Security → Copy API Key

### Phase 4: Environment Variables

Fill `.env` with user credentials:

```env
# Site
PUBLIC_SITE_URL=https://yourdomain.com

# Supabase (legacy format)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
PUBLIC_CLOUDINARY_API_KEY=your_api_key

# Security (generate if not provided)
CRON_SECRET=your_random_secret_string
CSRF_SECRET=your_random_csrf_secret

# Admin
ADMIN_EMAIL=your-admin@email.com

# Analytics (optional)
PUBLIC_ANALYTICS_PROVIDER=vercel
```

### Phase 5: Test Locally

```bash
npm run dev
# Open http://localhost:4321
```

**Verify:**
- [ ] Site loads without errors
- [ ] Dark mode toggle works
- [ ] `Ctrl+Shift+A` opens login modal
- [ ] Login with admin credentials works
- [ ] Admin dashboard loads

### Phase 6: Deploy to Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: deploy portfolio"
git push origin main
```

1. Go to [vercel.com](https://vercel.com) → Add New Project → Select repo
2. Vercel auto-detects Astro → Deploy
3. Go to Settings → Environment Variables
4. Add ALL variables from `.env`
5. Set for: Production, Preview, Development
6. Redeploy if needed

### Phase 7: Post-Deployment

1. Visit deployed URL
2. Press `Ctrl+Shift+A` → Login
3. In Admin Dashboard:
   - Click **Sync Static Data** to import fallback data
   - Go to **Settings** → Configure section visibility
   - Optionally enable "Use Static Data" per section

---

## 📂 FILE REFERENCE

### Static Data Files (Fallback)
| File | Content |
|---|---|
| `src/data/personal.ts` | Name, bio, title, location, email, socials |
| `src/data/projects.ts` | Project list |
| `src/data/skills.ts` | Skill categories |
| `src/data/experience.ts` | Work history |
| `src/data/testimonials.ts` | Client testimonials |
| `src/data/blog/*.mdx` | Blog posts (MDX format) |

### Admin Features
| Feature | How to Access |
|---|---|
| Full Admin Panel | `Ctrl+Shift+A` → Login |
| Contact Quick Edit | `Ctrl+Shift+C` → Login → Edit email/socials |
| Sync Static Data | Admin sidebar → Sync button |
| Section Visibility | Admin → Settings tab |
| Resume Upload | Admin → Resume tab |

### Available Social Platforms (for highlights)
GitHub, LinkedIn, X (Twitter), Instagram, Facebook, YouTube, TikTok, Reddit, Pinterest, Discord, Telegram, WhatsApp, Medium, DEV.to, StackOverflow, CodePen, Dribbble, Behance, Figma, Slack (20 platforms)

### Available Icons (for highlights)
briefcase, calendar, coffee, heart, star, user, mail, github, linkedin, x, instagram, facebook, youtube, tiktok, reddit, pinterest, discord, telegram, whatsapp, medium, devto, stackoverflow, codepen, dribbble, behance, figma, slack, map-pin, quote, download, check-circle, trophy, award, target, code, palette, rocket, globe, phone, message, zap (40+ icons)

---

## 🔧 KEY COMPONENTS

### Dynamic Sections (fetch from Supabase)
- `DynamicHero.tsx` — Hero section with name, title, tagline
- `DynamicAbout.tsx` — About section with bio, skills, highlights
- `DynamicProjects.tsx` — Project showcase
- `DynamicSkills.tsx` — Skills grid
- `DynamicExperience.tsx` — Work experience timeline
- `DynamicTestimonials.tsx` — Client testimonials
- `DynamicContact.tsx` — Contact section (email + socials)

### Admin Components
- `AdminDashboard.tsx` — Full CMS with tabs
- `AdminGate.tsx` — Hidden login modal
- `BlogPreviewModal.tsx` — Preview before publish
- `ProjectPreviewModal.tsx` — Project preview
- `UndoToast.tsx` — Undo delete operations
- `ConfirmDialog.tsx` — Safe delete confirmations
- `CloudinaryUpload.tsx` — Single image upload
- `CloudinaryMultiUpload.tsx` — Multiple image upload

### Utility Components
- `ReactIcon.tsx` — SVG icon system
- `ThemeToggle.tsx` — Dark/light mode
- `ContactForm.tsx` — Contact form with rate limiting
- `ResumeButton.tsx` — Resume download button

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Site loads at Vercel URL or custom domain
- [ ] HTTPS is working (Vercel provides free SSL)
- [ ] Dark mode toggle works and persists
- [ ] All navigation links work
- [ ] `Ctrl+Shift+A` opens admin login
- [ ] `Ctrl+Shift+C` opens contact quick edit (after login)
- [ ] Admin dashboard accessible after login
- [ ] Contact form submits successfully
- [ ] Messages appear in Admin → Messages
- [ ] Blog posts display correctly
- [ ] Project pages load
- [ ] Images load from Cloudinary
- [ ] Mobile layout is responsive
- [ ] Section visibility toggles work
- [ ] Resume download works (navbar and about page)

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---|---|
| `npm install` fails | Ensure Node.js 22.12.0+ installed |
| Styles not loading | Clear cache: `rm -rf .astro node_modules/.vite && npm run dev` |
| Admin login fails | Verify Supabase credentials in `.env` |
| Images not loading | Check `PUBLIC_CLOUDINARY_CLOUD_NAME` is correct |
| Sync fails | Verify `SUPABASE_SERVICE_ROLE_KEY` (no `PUBLIC_` prefix) |
| Build fails on Vercel | Ensure all environment variables set in Vercel dashboard |
| Scheduled posts not publishing | Verify `CRON_SECRET` matches in env and Vercel |

---

## 📖 DOCUMENTATION REFERENCE

| Document | For |
|---|---|
| [README.md](README.md) | Project overview |
| [docs/SETUP.md](docs/SETUP.md) | Detailed setup instructions |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin panel usage |
| [docs/CONTENT.md](docs/CONTENT.md) | Content management |
| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) | Customization options |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide |
| [docs/ANIMATIONS.md](docs/ANIMATIONS.md) | Animation system |

---

**AI Agent:** Use this guide to set up the portfolio. Ask the user for any missing credentials before proceeding. Handle all credentials securely — never log or expose them.