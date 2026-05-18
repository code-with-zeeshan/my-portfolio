# Setup Guide

## Prerequisites

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 22.12.0+ | `node -v` |
| npm | 10.0.0+ | `npm -v` |
| Git | 2.0+ | `git -v` |

## Step 1 — Install & Run

```bash
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio
npm install
npm run dev
# → http://localhost:4321
```

The site works immediately with static fallback data. No database required for local development.

## Step 2 — Supabase Setup (Required for Admin)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open **SQL Editor** → run the SQL setup file:
   - **Fresh database:** Use `supabase-rls-policies-prod.sql` (creates all tables from scratch)
   - **Existing database:** Use `supabase-rls-policies.sql` (includes migrations for schema updates)
3. Go to **Settings → API** and copy:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → Users** → Add user (your admin email + password)

## Step 3 — Cloudinary Setup (Required for Image Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. From **Dashboard** copy your `Cloud Name` → `PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Go to **Settings → Upload → Upload Presets** → Add Preset:
   - Name: `portfolio_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `portfolio`
   - Unique filename: ✅ Enabled
4. Copy `API Key` → `PUBLIC_CLOUDINARY_API_KEY`

> 💡 `f_auto` and `q_auto` (WebP/AVIF auto-format) are applied at delivery time via URL parameters — you do NOT need any preset setting for this. It's handled automatically in `getOptimizedUrl()`.

## Step 4 — Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
PUBLIC_CLOUDINARY_API_KEY=your_api_key
# Cron job security (for scheduled post publishing)
CRON_SECRET=your_random_secret_string
# CSRF protection for POST API endpoints
CSRF_SECRET=your_random_csrf_secret
# Optional: restrict admin access to specific email
# ADMIN_EMAIL=admin@example.com
# Analytics provider: vercel | plausible | posthog | umami | none
PUBLIC_ANALYTICS_PROVIDER=vercel
# ── Plausible config (cloud) ──
PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
PUBLIC_PLAUSIBLE_API_KEY=your-api-key
# ── PostHog config ──
# No additional config needed for PostHog
# ── Umami config ──
# Get your website ID from umami.is dashboard
PUBLIC_UMAMI_WEBSITE_ID=your_website_id_here
PUBLIC_UMAMI_URL=https://umami.example.com
```

> **💡 Note:** You can also edit ALL your details through the **Admin Dashboard** (`Ctrl+Shift+A`) after deployment - no coding required!

> See **[`AI-SETUP-GUIDE.md`](AI-SETUP-GUIDE.md)** for automated setup with AI agents.

## Step 5 — Optimize Images

Compress fallback images to reduce download size:

```bash
npm run compress:images
```

This uses [Sharp](https://github.com/lovell/sharp) to compress images in `public/images/` and `public/*.png` at quality 70. Typical savings: **~70% reduction** on uncompressed images.

> **When to run:** After adding new images to `public/images/`, or before production deployment.

## Step 6 — Seed Your Data

1. Start dev server: `npm run dev`
2. Press `Ctrl+Shift+A` → log in with your Supabase credentials
3. In the Admin sidebar, click **⬆ Sync Static Data**
4. This imports your `src/data/*.ts` files into Supabase (safe to run multiple times — skips existing data)
5. Optionally, go to **Settings** tab to toggle section visibility and configure per-section static data sync

### New Features to Explore

After syncing, try these new features:
- **Drag & Drop** — In Profile tab, drag social links and highlights to reorder them
- **Clickable Social Handles** — Click on social platform names to add them as highlights
- **Clickable Icons** — Click on icon names to add highlights with smart default labels
- **Auto Sort Order** — New items in Projects, Skills, Experience, Testimonials are added at top with sort_order: 1, existing items auto-adjust

## Troubleshooting

| Problem | Fix |
|---|---|
| `astro dev` fails | Node.js 22+ required: `nvm install 22 && nvm use 22` |
| Styles not updating | `rm -rf .astro node_modules/.vite && npm run dev` |
| Content not appearing | Restart dev server after adding/removing MDX files |
| Sync fails with RLS error | Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly (no `PUBLIC_` prefix) |
| Images not loading | Check `PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env` |
| Admin redirects to home | Session expired — press `Ctrl+Shift+A` and log in again |
| Scheduled posts not publishing | Verify `CRON_SECRET` matches in `.env` and Vercel crons |
| Analytics not tracking | Check `PUBLIC_ANALYTICS_PROVIDER` is set correctly (vercel/plausible/posthog/umami/none) |
| CSRF errors on contact form | Verify `CSRF_SECRET` is set in `.env` and Vercel environment variables |