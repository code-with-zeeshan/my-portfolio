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
- Available icons: `briefcase`, `calendar`, `coffee`, `heart`, `star`, `user`
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

### 7. Images

| Image | Location | Recommended Size |
|---|---|---|
| Profile photo | `public/images/profile.webp` or upload via Admin | Square, min 600×600px |
| Project screenshots | `public/images/projects/*.webp` or upload via Admin | 16:9, min 1280×720px |
| OG/Social share | `public/og-image.png` | Exactly 1200×630px |
| Favicon | `public/favicon.svg` | SVG format |
| Resume | Upload via Admin → Resume tab | PDF only |

### 8. Blog Posts

Add `.mdx` files to `src/data/blog/` or create via Admin → Blog → **+ New Post**.

### 9. Projects

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