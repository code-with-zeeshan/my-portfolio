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
| **Profile** | Edit name, title, bio, location, social links, availability, profile photo; **drag & drop** to reorder social links and highlights |
| **Profile → Top Skills** | Add/edit/remove skill bars with name and % level |
| **Profile → Highlights** | Edit stat cards (icon, label, value) shown below bio; **drag & drop** to reorder |
| **Projects** | Add, edit, delete projects; upload images via Cloudinary; toggle featured; sort order auto-adjusts (1,2,3...) |
| **Skills** | Edit skill category names and tag lists; sort order auto-adjusts |
| **Experience** | Edit work history, roles, achievements; sort order auto-adjusts |
| **Blog** | Write/edit/delete posts in Markdown; publish/unpublish; schedule posts; upload hero images; **search posts** |
| **Testimonials** | Add, edit, remove testimonials; sort order auto-adjusts |
| **Messages** | Read contact form submissions; mark as read/unread; delete (with **undo support** via ConfirmDialog + UndoToast) |
| **Resume** | Upload new PDF resume (auto-updates Download Resume button site-wide); removed resumes go to history |
| **Settings** | Toggle section visibility (Projects, Skills, Experience, Testimonials, Blog) and sync specific static data sections |
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
- **Section Visibility Toggle** — Settings tab allows hiding/showing sections on homepage and about page
- **Use Static Data** — Per-section toggle to sync specific static data to Supabase
- **Instant Preview** — Section visibility changes reflect immediately without page refresh
- **Resume with History** — Removed resumes move to history; can be restored or deleted permanently
- **Drag & Drop Reordering** — Drag social links and highlights in Profile tab to reorder them (grab handle on left side)
- **Clickable Social Handles** — Click on social platform names (GitHub, LinkedIn, X, etc.) in Profile tab to add as highlights
- **Clickable Icons** — Click on icon names in Profile tab to add them as highlights with smart default labels
- **Auto Sort Order** — Sort orders auto-adjust (1,2,3,4...) when adding/deleting items in Projects, Skills, Experience, Testimonials
- **Add at Top** — New items are added at the top with sort_order: 1, existing items shift down
- **Centered Sidebar Icons** — Admin panel sidebar icons are centered when collapsed

### Contact Page Quick Edit

The contact section on the homepage now supports quick editing without needing the full admin panel:

- **Access:** Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) on the homepage
- **Login:** Enter your admin credentials
- **Edit:** Contact info becomes editable with dropdown menus to change social platforms
- **Email + Socials:** You can edit email and up to 4 social handles (3 minimum, 5 maximum including email)
- **Platform Selection:** Click on any handle label (Email, GitHub, LinkedIn, etc.) to see a dropdown of available platforms
- **Add/Remove:** Use + and X buttons on the last handle to add or remove social handles
- **Save:** Click the Save button to persist edit mode across page refreshes
- **Exit:** Click Exit to close edit mode, with option to stay logged in or log out

The editable state uses ReactIcon component for all SVG icons, ensuring consistent rendering across all social platforms.

## Syncing Static Data

The **⬆ Sync Static Data** button in the sidebar imports your `src/data/*.ts` files into Supabase. It is:
- **Safe to run multiple times** — skips tables that already have data
- **Required on first setup** — populates the database before you customize
- **Per-section sync** — Use the "Use Static Data" toggle on each section in Settings tab to sync specific sections only

### Section Visibility

In the **Settings** tab, you can:
1. **Toggle section visibility** — Show or hide sections (Projects, Skills, Experience, Testimonials, Blog) on homepage and about page
2. **Use Static Data** — Enable per-section toggle to sync specific static data when clicking "Sync Static Data"
3. **Instant preview** — Changes reflect immediately on the site without page refresh (uses localStorage + storage events)

The section visibility is stored in both:
- **Supabase** (`app_settings` table) — for persistence
- **localStorage** — for instant homepage/about page updates without refresh

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
| `x` | X (Twitter) logo |
| `instagram` | Instagram logo |
| `facebook` | Facebook logo |
| `youtube` | YouTube logo |
| `tiktok` | TikTok logo |
| `reddit` | Reddit logo |
| `pinterest` | Pinterest logo |
| `discord` | Discord logo |
| `telegram` | Telegram logo |
| `whatsapp` | WhatsApp logo |
| `medium` | Medium logo |
| `devto` | DEV.to logo |
| `stackoverflow` | Stack Overflow logo |
| `codepen` | CodePen logo |
| `dribbble` | Dribbble logo |
| `behance` | Behance logo |
| `figma` | Figma logo |
| `slack` | Slack logo |
| `map-pin` | Location pin |
| `quote` | Quote marks |
| `download` | Download arrow |
| `check-circle` | Success checkmark |
| `trophy` | Trophy icon |
| `award` | Award icon |
| `target` | Target icon |
| `code` | Code icon |
| `palette` | Palette icon |
| `rocket` | Rocket icon |
| `globe` | Globe icon |
| `phone` | Phone icon |
| `message` | Message icon |
| `zap` | Zap icon |

## Social Platform Names

Available social platforms to add in Profile tab:

- GitHub, LinkedIn, X (Twitter), Instagram, Facebook, YouTube, TikTok
- Reddit, Pinterest, Discord, Telegram, WhatsApp
- Medium, DEV.to, StackOverflow, CodePen, Dribbble, Behance, Figma, Slack

## Image Uploads

All images upload directly to **Cloudinary CDN**. After uploading:
- Images are automatically served in WebP/AVIF format to supported browsers
- Images are resized to optimal dimensions per use case
- Old images remain in Cloudinary until manually deleted from the dashboard

### Fallback Image Compression

Fallback images in `public/images/` are compressed at quality 70 using Sharp to reduce download size. Run `npm run compress:images` after adding or replacing fallback images. This is especially impactful for the Web app manifest PNGs (224 KB → ~27 KB).

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