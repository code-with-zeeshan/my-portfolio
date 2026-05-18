# Customization Guide

## Quick Start — What to Change First

### 1. Personal Information

Via **Admin Panel** (recommended): `Ctrl+Shift+A` → Profile tab

Or directly in `src/data/personal.ts`:

```typescript
export const personal = {
  name: "Your Real Name",
  title: "Your Job Title",
  tagline: "Your tagline.",
  bio: "Your bio. Use \\n\\n for paragraph breaks.",
  location: "City, Country",
  email: "your@email.com",
  availability: "Open to opportunities",
  socials: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://x.com/yourusername",
  },
};
```

### 2. Branding / Initials

Search and replace in these files:

| Find | Replace | Files |
|---|---|---|
| `YN.` | Your initials + `.` | `Header.astro`, `Footer.astro`, `AdminDashboard.tsx` |
| `Your Name` | Your real name | `Footer.astro` |
| `Mohammad Zeeshan` | Your name | `BaseLayout.astro`, `lib/config.ts` |

### 3. Top Skills (Skill Bars)

Via Admin → Profile → **Top Skills**:
- Click **+ Add Skill**
- Type skill name, set % level (0–100)
- Live bar preview shown immediately
- Click **Save Top Skills**

### 4. Highlights (Stat Cards)


Via Admin → Profile → **Highlights**:
- Edit icon name, label, value
- Available icons: `briefcase`, `calendar`, `coffee`, `heart`, `star`, `user`, `mail`, `github`, `linkedin`, `twitter`, `map-pin`, `quote`, `download`, `check-circle`
- Click **Save Highlights**

### 5. Colors

Edit in `src/styles/global.css`:

```css
@theme {
  --color-brand-500: oklch(0.60 0.16 260); /* Change 260 to rotate hue */
}
```

| Hue | Color |
|---|---|
| `260` | Purple/Indigo (default) |
| `220` | Blue |
| `160` | Green/Teal |
| `30` | Orange |
| `350` | Pink/Rose |

### 6. Reordering Highlights

In Admin → Profile → **Highlights**:
- Drag by the grip handle on the left to reorder
- Sort order auto-adjusts (1,2,3...)
- New highlights are added at top

### 7. Available Icons

Full list of icons available for highlights:
- **General:** `briefcase`, `calendar`, `coffee`, `heart`, `star`, `user`, `mail`, `map-pin`, `quote`, `download`, `check-circle`, `trophy`, `award`, `target`, `code`, `palette`, `rocket`, `globe`, `phone`, `message`, `zap`
- **Social:** `github`, `linkedin`, `x` (Twitter), `instagram`, `facebook`, `youtube`, `tiktok`, `reddit`, `pinterest`, `discord`, `telegram`, `whatsapp`, `medium`, `devto`, `stackoverflow`, `codepen`, `dribbble`, `behance`, `figma`, `slack`

### 8. Social Platforms

Available social platforms to add via Admin → Profile → **Social Links**:
- GitHub, LinkedIn, X (Twitter), Instagram, Facebook, YouTube, TikTok
- Reddit, Pinterest, Discord, Telegram, WhatsApp
- Medium, DEV.to, StackOverflow, CodePen, Dribbble, Behance, Figma, Slack

### 6. Site URL

`astro.config.mjs`:
```js
site: "https://yourdomain.com"
```

Also update `PUBLIC_SITE_URL` in your `.env` and Vercel environment variables.

### 7. Scheduled Post Publishing

Generate a secure cron secret:

```bash
# Generate a random 64-character hex string
openssl rand -hex 32
```

Set in your `.env` and Vercel environment variables:

```env
CRON_SECRET=your_generated_secret
```

### 8. Analytics

Edit in `.env`:

```env
# Options: vercel | plausible | posthog | umami | none
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

For self-hosted Plausible, also set:
```env
PUBLIC_PLAUSIBLE_API_HOST=https://mydomain.com/stats
PUBLIC_PLAUSIBLE_SCRIPT_URL=https://mydomain.com/stats/js/script.js
```

### 9. Images

| Image | Location | Recommended Size |
|---|---|---|
| Profile photo | `public/images/profile.webp` or upload via Admin | Square, min 600×600px |
| Project screenshots | `public/images/projects/*.webp` or upload via Admin | 16:9, min 1280×720px |
| OG/Social share | `public/og-image.png` | Exactly 1200×630px |
| Favicon | `public/favicon.svg` | SVG format |
| Resume | Upload via Admin → Resume tab | PDF only |

> **💡 Image Compression:** Run `npm run compress:images` to compress fallback images at quality 70 using Sharp. This reduces download size significantly — especially for the Web app manifest PNGs (224 KB → ~27 KB). The script is located at `scripts/compress-images.mjs` and is included in the project's `package.json`.

### 10. Blog Posts

Add `.mdx` files to `src/data/blog/` or create via Admin → Blog → **+ New Post**.

### 11. Blog Search

The blog index now has a **search bar** that filters posts by title, description, or tags.

- Works with both static MDX files and dynamic Supabase posts
- No configuration needed — works automatically

### 12. Server-Side Contact Form

The contact form now uses a server-side API endpoint (`/api/contact`) with:
- Server-side validation and sanitization
- Per-email rate limiting (1 submission per minute)
- No Supabase client dependency needed

No configuration needed — works automatically.

### 13. Projects

Edit `src/data/projects.ts` or use Admin → Projects → **+ Add Project**.

### 14. Section Visibility

Via Admin → Settings:
- Toggle sections (Projects, Skills, Experience, Testimonials, Blog) to show/hide on homepage and about page
- Use "Use Static Data" button on each section to enable per-section sync
- Changes reflect instantly without page refresh

### 15. Resume Management

Via Admin → Resume:
- Upload new PDF resume
- Removed resumes go to history (can be restored)
- Both navbar and about page resume buttons check removed_resume_ids localStorage for instant updates

## Adding New Icon Names

If you need an icon not in `ReactIcon.tsx` or `Icons.astro`:

1. Find the icon path at [lucide.dev](https://lucide.dev)
2. Add the SVG path string to **both** `Icons.astro` and `ReactIcon.tsx`:

```ts
// In Icons.astro and ReactIcon.tsx — add to the icons object:
"icon-name": '<path d="M..."/>',
```

Both files must stay in sync.

## AI-Powered Setup

Want to automate your setup? See **[`AI-SETUP-GUIDE.md`](AI-SETUP-GUIDE.md)**:

- Fill in the `USER CONFIGURATION SECTION` with your details
- Provide to any AI agent for automated setup
- Or skip and edit everything through the **Admin Dashboard** (`Ctrl+Shift+A`) after deployment!