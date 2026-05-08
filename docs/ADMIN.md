# Admin Panel Guide

## Accessing the Admin Panel

The admin panel is intentionally hidden from visitors.

### Method 1: Keyboard Shortcut (Recommended)
Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac) on any page to open the login modal.

### Method 2: Direct URL
Navigate to `/admin` — redirects to home if not authenticated.

## Login

Use the email and password you created in **Supabase → Authentication → Users**.

## Session Persistence

Closing the browser tab does **not** sign you out. Your session persists in `localStorage` for up to 7 days (Supabase auto-refreshes the token silently). You are only signed out when:
- You click "Sign Out" in the admin sidebar
- Your refresh token expires (7 days of inactivity)
- You clear browser data

## Admin Features

| Tab | What You Can Do |
|---|---|
| **Profile** | Edit name, title, bio, location, social links, availability, profile photo |
| **Profile → Top Skills** | Add/edit/remove skill bars with name and % level |
| **Profile → Highlights** | Edit stat cards (icon, label, value) shown below bio |
| **Projects** | Add, edit, delete projects; upload images via Cloudinary; toggle featured |
| **Skills** | Edit skill category names and tag lists |
| **Experience** | Edit work history, roles, achievements |
| **Blog** | Write/edit/delete posts in Markdown; publish/unpublish; schedule posts; upload hero images; **search posts** |
| **Testimonials** | Add, edit, remove testimonials |
| **Messages** | Read contact form submissions; mark as read/unread; delete (with **undo support** via ConfirmDialog + UndoToast) |
| **Resume** | Upload new PDF resume (auto-updates Download Resume button site-wide) |
| **Analytics** | View Plausible analytics dashboard; generate cron secrets for scheduled posts |

### New Features

- **Undo Support** — Delete operations now show an undo toast notification (5 seconds to undo) via `UndoToast.tsx`
- **Confirm Dialogs** — Destructive actions (delete) now show a confirmation dialog via `ConfirmDialog.tsx`
- **Error Boundary** — Admin panel is wrapped in `AdminErrorBoundary.tsx` to prevent crashes from propagating
- **Blog Search** — Search posts by title, description, or tags in the Blog tab via `BlogSearch.tsx`
- **Rate Limiting** — API endpoints (`/api/sync`, `/api/contact`) now have Supabase-backed rate limiting
- **CSRF Protection** — POST API endpoints now require a valid CSRF token (`/api/publish-scheduled`)
- **CSP Security** — Content Security Policy now uses nonce-based approach for better security
- **Input Sanitization** — Blog post HTML is now sanitized using `sanitize-html` library
- **Server-Side Contact Form** — Contact form now submits via `/api/contact` with server-side validation and rate limiting

## Syncing Static Data

The **⬆ Sync Static Data** button in the sidebar imports your `src/data/*.ts` files into Supabase. It is:
- **Safe to run multiple times** — skips tables that already have data
- **Required on first setup** — populates the database before you customize

## How Data Flows

```
src/data/*.ts (static fallback)
        ↓ imported by
Admin: Sync Static Data → POST /api/sync
        ↓ uses service_role key (bypasses RLS)
Supabase Database
        ↓ fetched by
Dynamic* React components
        ↓
Portfolio pages (visitor-facing)
```

Visitors can only **read** data (public RLS policies).
The admin can **read + write** (authenticated RLS policies + service_role for sync).
Contact form submissions **insert** into `messages` (public insert policy).

## Icon Names for Highlights

When editing highlight icons, use these names:

| Name | Renders |
|---|---|
| `briefcase` | Work/Experience icon |
| `calendar` | Date/Projects icon |
| `coffee` | Coffee cup |
| `heart` | Heart |
| `star` | Star |
| `user` | Person icon |
| `mail` | Envelope |
| `github` | GitHub logo |
| `linkedin` | LinkedIn logo |
| `twitter` | X/Twitter logo |
| `map-pin` | Location pin |
| `quote` | Quote marks |
| `download` | Download arrow |
| `check-circle` | Success checkmark |

## Image Uploads

All images upload directly to **Cloudinary CDN**. After uploading:
- Images are automatically served in WebP/AVIF format to supported browsers
- Images are resized to optimal dimensions per use case
- Old images remain in Cloudinary until manually deleted from the dashboard

## Backend: Supabase

- **Dashboard:** supabase.com → Your Project → Table Editor
- **Database:** PostgreSQL (8 tables for all content)
- **Auth:** Email/password (single admin user)
- **Free tier:** 500MB database, unlimited API calls

## Generating Cron Secrets

To set up scheduled post publishing, generate a secure cron secret:

1. In the admin panel, go to **Analytics** tab
2. Click **Generate Secret** button
3. The API generates a cryptographically secure 64-character hex string
4. Copy this value to your `.env` as `CRON_SECRET`
5. Also add to Vercel environment variables

Alternatively, generate manually:
```bash
openssl rand -hex 32
```

The cron job runs daily at midnight (Vercel free tier) to publish scheduled posts.