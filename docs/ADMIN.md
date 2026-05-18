# Admin Panel Guide

The admin panel is a full CMS for managing all portfolio content. It is intentionally hidden from visitors.

## Accessing the Admin

| Method | How |
|---|---|
| **Keyboard** | Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac) on any page |
| **URL** | Navigate to `/admin` — redirects if not authenticated |

## Login

Use the email and password created in **Supabase → Authentication → Users**.

## Session Persistence

- Closing the browser tab does **not** sign you out
- Session persists in `localStorage` for up to 7 days
- You are signed out when:
  - You click "Sign Out" in the admin sidebar
  - Your refresh token expires (7 days of inactivity)
  - You clear browser data

## Admin Tabs

| Tab | Features |
|---|---|
| **Profile** | Edit name, title, bio, location, social links, availability, profile photo; drag & drop to reorder social links and highlights |
| **Top Skills** | Add/edit/remove skill bars with name and % level |
| **Highlights** | Edit stat cards (icon, label, value) shown below bio; drag & drop to reorder |
| **Projects** | Add, edit, delete projects; upload images via Cloudinary; toggle featured; sort order auto-adjusts |
| **Skills** | Edit skill category names and tag lists; sort order auto-adjusts |
| **Experience** | Edit work history, roles, achievements; sort order auto-adjusts |
| **Blog** | Write/edit/delete posts in Markdown; publish/unpublish; schedule posts; upload hero images; search posts |
| **Testimonials** | Add, edit, remove testimonials; sort order auto-adjusts |
| **Messages** | Read contact form submissions; mark as read/unread; delete (with undo support) |
| **Resume** | Upload new PDF resume; removed resumes go to history |
| **Settings** | Toggle section visibility; configure per-section static data sync |
| **Analytics** | View analytics dashboard; generate cron secrets |

## Contact Page Quick Edit

Edit contact info directly on the homepage without opening the full admin panel:

1. **Access**: Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) on the homepage
2. **Login**: Enter admin credentials
3. **Edit**: Contact section becomes editable with dropdown menus
4. **Email + Socials**: Edit email and up to 4 social handles (3 minimum, 5 maximum including email)
5. **Platform Selection**: Click on any handle label to see a dropdown of available platforms
6. **Add/Remove**: Use + and X buttons to manage social handles
7. **Save**: Click Save to persist edit mode across page refreshes
8. **Exit**: Click Exit to close edit mode, with option to stay logged in or log out

> 💡 All icons use ReactIcon component for consistent rendering across all social platforms.

## Section Visibility

In the **Settings** tab:
1. Toggle section visibility (Projects, Skills, Experience, Testimonials, Blog) on homepage and about page
2. Enable "Use Static Data" per-section to sync specific static data only
3. Changes reflect immediately without page refresh (uses localStorage + storage events)

## Static Data Sync

The **⬆ Sync Static Data** button imports `src/data/*.ts` into Supabase:
- Safe to run multiple times — skips tables with existing data
- Required on first setup to populate the database
- Per-section sync available via "Use Static Data" toggle in Settings

## Icon Names for Highlights

Available icons for highlight cards:

| Name | Icon |
|---|---|
| `briefcase` | Work/Experience |
| `calendar` | Date/Projects |
| `coffee` | Coffee cup |
| `heart` | Heart |
| `star` | Star |
| `user` | Person |
| `mail` | Envelope |
| `github` | GitHub |
| `linkedin` | LinkedIn |
| `x` | X (Twitter) |
| `instagram` | Instagram |
| `facebook` | Facebook |
| `youtube` | YouTube |
| `tiktok` | TikTok |
| `reddit` | Reddit |
| `pinterest` | Pinterest |
| `discord` | Discord |
| `telegram` | Telegram |
| `whatsapp` | WhatsApp |
| `medium` | Medium |
| `devto` | DEV.to |
| `stackoverflow` | Stack Overflow |
| `codepen` | CodePen |
| `dribbble` | Dribbble |
| `behance` | Behance |
| `figma` | Figma |
| `slack` | Slack |
| `map-pin` | Location pin |
| `quote` | Quote marks |
| `download` | Download arrow |
| `check-circle` | Success checkmark |
| `trophy` | Trophy |
| `award` | Award |
| `target` | Target |
| `code` | Code |
| `palette` | Palette |
| `rocket` | Rocket |
| `globe` | Globe |
| `phone` | Phone |
| `message` | Message |
| `zap` | Zap |

## Social Platform Options

Available social platforms to add in Profile:

GitHub, LinkedIn, X (Twitter), Instagram, Facebook, YouTube, TikTok, Reddit, Pinterest, Discord, Telegram, WhatsApp, Medium, DEV.to, StackOverflow, CodePen, Dribbble, Behance, Figma, Slack

## Image Uploads

All images upload directly to **Cloudinary CDN**:
- Automatically served in WebP/AVIF format
- Resized to optimal dimensions per use case
- Old images remain in Cloudinary until manually deleted

### Fallback Image Compression

Run `npm run compress:images` after adding or replacing fallback images in `public/images/`. This uses Sharp at quality 70.

## Generating Cron Secrets

For scheduled post publishing:

1. In admin panel, go to **Analytics** tab
2. Click **Generate Secret** button
3. Copy the generated value to `CRON_SECRET` in `.env` and Vercel

Or generate manually:
```bash
openssl rand -hex 32
```

The cron job runs daily at midnight (Vercel free tier) to publish scheduled posts.

## How Data Flows

```
src/data/*.ts (static fallback)
        ↓
Admin: Sync Static Data → POST /api/sync
        ↓
Supabase Database
        ↓
Dynamic* React components
        ↓
Portfolio pages (visitor-facing)
```

Visitors can only **read** data (public RLS policies).
The admin can **read + write** (authenticated RLS policies).
Contact form submissions **insert** into `messages` (public insert policy).