# Setup Guide

This guide walks through setting up the portfolio locally and connecting all required services.

## Prerequisites

| Tool | Version | Check Command |
|---|---|---|
| Node.js | 22.12.0+ | `node -v` |
| npm | 10.0.0+ | `npm -v` |
| Git | 2.0+ | `git -v` |

## Step 1 — Clone & Install

```bash
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio
npm install
npm run dev
# → http://localhost:4321
```

The site works immediately with static fallback data. No database required for local development.

## Step 2 — Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Enter project name, password, region
3. Wait 2-3 minutes for setup

### Run Database Schema
1. Open **SQL Editor** in Supabase dashboard
2. Choose the appropriate SQL file:
   - **Fresh database**: Use `supabase-rls-policies-prod.sql` (all CREATE TABLE statements)
   - **Existing database**: Use `supabase-rls-policies.sql` (includes ALTER TABLE + migrations)
3. Copy entire file contents → Paste in SQL Editor → Run

### Get API Keys
1. Go to **Settings → API**
2. Copy:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Supabase API Keys:** Both formats work:
> - **Legacy**: JWT tokens starting with `eyJ...` (Settings → API → "Project API keys")
> - **New**: `sb_publishable...` (anon) + `sb_secret...` (secret) (Settings → API → "New API keys")

### Create Admin User
1. Go to **Authentication → Users**
2. Click **Add user**
3. Enter admin email and password
4. This is used for `Ctrl+Shift+A` login

## Step 3 — Cloudinary Setup

### Create Account
1. Go to [cloudinary.com](https://cloudinary.com) → Create free account

### Get Cloud Name
1. From **Dashboard**, copy your `Cloud Name`
2. Set as `PUBLIC_CLOUDINARY_CLOUD_NAME`

### Create Upload Preset
1. Go to **Settings → Upload → Upload Presets**
2. Click **Add Upload Preset**
3. Configure:
   - Preset Name: `portfolio_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `portfolio`
   - Unique filename: ✅ Enabled

### Get API Key
1. Go to **Settings → Security**
2. Copy **API Key** → `PUBLIC_CLOUDINARY_API_KEY`

> 💡 Image optimization (`f_auto`, `q_auto`) is handled automatically in `getOptimizedUrl()` — no preset configuration needed for this.

## Step 4 — Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Site
PUBLIC_SITE_URL=http://localhost:4321

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

# Optional: restrict admin to specific email
# ADMIN_EMAIL=admin@example.com

# Analytics (vercel | plausible | posthog | umami | none)
PUBLIC_ANALYTICS_PROVIDER=vercel

# Plausible (if using)
PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
PUBLIC_PLAUSIBLE_API_KEY=your-api-key
```

> 💡 All content can also be edited through the **Admin Dashboard** (`Ctrl+Shift+A`) after deployment — no coding required!

## Step 5 — Image Compression

Compress fallback images to reduce download size:

```bash
npm run compress:images
```

This uses [Sharp](https://github.com/lovell/sharp) to compress images in `public/images/` and `public/*.png` at quality 70.

> **When to run:** After adding new images to `public/images/`, or before production deployment.

## Step 6 — Seed Data

1. Start dev server: `npm run dev`
2. Press `Ctrl+Shift+A` → login with Supabase credentials
3. In admin sidebar, click **⬆ Sync Static Data**
4. This imports `src/data/*.ts` into Supabase (safe to run multiple times)
5. Optionally go to **Settings** tab to configure section visibility

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm run dev` fails | Node.js 22+ required: `nvm install 22 && nvm use 22` |
| Styles not updating | `rm -rf .astro node_modules/.vite && npm run dev` |
| Content not appearing | Restart dev server after adding/removing MDX files |
| Sync fails with RLS error | Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly (no `PUBLIC_` prefix) |
| Images not loading | Check `PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env` |
| Admin redirects to home | Session expired — press `Ctrl+Shift+A` and log in again |
| Scheduled posts not publishing | Verify `CRON_SECRET` matches in `.env` and Vercel crons |
| CSRF errors on contact form | Verify `CSRF_SECRET` is set in `.env` and Vercel |

---

See [`AI-SETUP-GUIDE.md`](../AI-SETUP-GUIDE.md) for AI agent setup instructions.