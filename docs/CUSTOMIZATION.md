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

### 10. Blog Posts

Add `.mdx` files to `src/data/blog/` or create via Admin → Blog → **+ New Post**.

### 11. Projects

Edit `src/data/projects.ts` or use Admin → Projects → **+ Add Project**.

## Adding New Icon Names

If you need an icon not in `ReactIcon.tsx` or `Icons.astro`:

1. Find the icon path at [lucide.dev](https://lucide.dev)
2. Add the SVG path string to **both** `Icons.astro` and `ReactIcon.tsx`:

```ts
// In Icons.astro and ReactIcon.tsx — add to the icons object:
"icon-name": '<path d="M..."/>',
```

Both files must stay in sync.