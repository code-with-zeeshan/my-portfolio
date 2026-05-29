# Personal Portfolio Website

A modern, full-stack portfolio built with **Astro 6**, **React 18**, **Tailwind CSS**, **Supabase**, and **Cloudinary** — featuring a hidden admin dashboard for live content management.

![Astro](https://img.shields.io/badge/Astro-6.x-purple?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=flat-square&logo=tailwindcss)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448c5?style=flat-square&logo=cloudinary)

## Features

### Content & Display
- **Dynamic Content** — All sections fetch live data from Supabase with static fallbacks
- **Blog with MDX** — Write blog posts in Markdown/MDX with syntax highlighting
- **Project Showcase** — Featured project carousel and card grid with case studies
- **Project Videos** — Add MP4, WebM, or GIF demos to projects; rendered with HTML5 video
- **Testimonials Carousel** — Animated client testimonials section
- **Dark/Light Mode** — Toggle with localStorage persistence and system preference detection
- **Section Visibility** — Toggle sections (Projects, Skills, Experience, Testimonials, Blog) to show/hide on homepage and about page
- **Instant Preview** — Section visibility changes reflect immediately without page refresh
- **Font Selector** — Choose between Inter, Onest, Outfit, or Geist from Settings; persists cross-device via Supabase

### Admin & CMS
- **Hidden Admin Panel** — Full CRUD dashboard accessible via `Ctrl+Shift+A`
- **Contact Page Quick Edit** — Edit email and social handles directly on homepage via `Ctrl+Shift+C`
- **Drag & Drop Reordering** — Reorder social links, highlights, and top skills in Profile tab
- **Markdown Editors** — Rich markdown editing (bold, italic, links, headings, code blocks) for blog posts and project descriptions
- **Clickable Social Handles** — Click platform names to add as highlights
- **Clickable Icons** — Click icon names to add highlights with smart default labels
- **Auto Sort Order** — Sort orders auto-adjust (1,2,3...) when adding/deleting items
- **Undo Support** — Undo toast notifications for delete operations
- **Confirm Dialogs** — Safe confirmation for destructive actions

### Media & Assets
- **Cloudinary CDN** — Auto-optimized images (WebP/AVIF, responsive sizing)
- **Resume Management** — Upload and update resume PDF via admin
- **Image Compression** — Fallback images compressed at quality 70

### Security & Performance
- **Security Hardened** — CSP, CSRF protection, input sanitization with `sanitize-html`
- **Server-Side Contact Form** — Rate limiting & server-side validation
- **Rate Limiting** — Per-email rate limiting for contact form
- **SEO Optimized** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation, skip-to-content link
- **Performance Optimized** — Self-hosted variable fonts, deferred JS hydration (`client:visible`), compressed HTML, unused dependency removal

### Analytics
- Supports Plausible, Vercel, PostHog, or Umami Analytics

## Tech Stack

| Technology | Purpose |
|---|---|
| Astro 6 | Static site framework with island architecture |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS v4 | Utility-first CSS framework |
| React 18 | Interactive UI components (islands) |
| Supabase | PostgreSQL database, authentication, storage |
| Cloudinary | CDN image delivery and optimization |
| shadcn/ui | Accessible component library |
| MDX | Markdown with JSX for blog posts |
| Vercel | Hosting and deployment |

## Project Structure

```
my-portfolio/
├── public/                      # Static assets
│   ├── images/                  # Fallback images
│   ├── favicon.svg
│   └── resume.pdf               # Resume fallback
│
├── src/
│   ├── components/
│   │   ├── layout/             # Header, Footer, ThemeToggle, MobileNav
│   │   ├── react/
│   │   │   ├── sections/        # Dynamic sections (DynamicHero, DynamicAbout, etc.)
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminGate.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ReactIcon.tsx
│   │   │   ├── ResumeButton.tsx
│   │   │   └── *.tsx            # UI components
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── content.config.ts        # Astro Content Collection schemas
│   │
│   ├── data/                    # Static fallback data
│   │   ├── blog/                # MDX blog posts
│   │   └── *.ts                # Personal, projects, skills, etc.
│   │
│   ├── layouts/                # BaseLayout, BlogLayout, AdminLayout
│   │
│   ├── lib/                    # Utilities, supabase, cloudinary, types
│   │
│   ├── pages/
│   │   ├── index.astro          # Home page
│   │   ├── about.astro          # About page
│   │   ├── admin/               # Admin dashboard
│   │   ├── api/                 # API endpoints (contact, sync, publish-scheduled)
│   │   ├── blog/                # Blog listing and posts
│   │   └── projects/            # Projects listing and pages
│   │
│   └── styles/                  # global.css
│
├── docs/                        # Documentation
│   ├── ADMIN.md
│   ├── CONTENT.md
│   ├── SETUP.md
│   └── *.md
│
├── supabase-rls-policies.sql          # Schema for existing database (migrations)
├── supabase-rls-policies-prod.sql     # Fresh install schema
└── package.json
```

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 22.12.0+ |
| npm | 10.0.0+ |
| Git | 2.0+ |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Astro type checking only |
| `npm run compress:images` | Compress fallback images at quality 70 |

## Environment Variables

```env
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
PUBLIC_CLOUDINARY_API_KEY=your_api_key
CRON_SECRET=your_random_secret_string
CSRF_SECRET=your_random_csrf_secret_string
PUBLIC_ANALYTICS_PROVIDER=plausible
PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is server-only — never exposed to the browser.

### Supabase API Keys — Legacy vs New Format

Supabase offers two API key formats:

| Format | Key Prefix | Where to Find |
|--------|------------|---------------|
| **Legacy** | `eyJ...` (JWT) | Settings → API → "Project API keys" |
| **New** | `sb_publishable...` (anon), `sb_secret...` (secret) | Settings → API → "New API keys" |

**Both formats work** — just replace the values in your `.env`:

```env
# Legacy format (JWT tokens starting with eyJ...)
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# New format (sb_publishable + sb_secret)
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_key_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_key_xxxxxxxxxxxxxxxxxxxxx
```

The codebase automatically handles both formats — no code changes needed.

## Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run SQL** in the SQL Editor:
   - **Fresh database**: Use `supabase-rls-policies-prod.sql`
   - **Existing database**: Use `supabase-rls-policies.sql` (includes migrations)
3. **Create storage bucket** named `portfolio-assets` (make it public)
4. **Add admin user** in Authentication → Users

See [`docs/SETUP.md`](docs/SETUP.md) for detailed instructions.

## Accessing Admin

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+A` | Open admin login |
| `Ctrl+Shift+C` | Quick edit contact info (after login) |

## Customization

1. **Edit content** — Update `src/data/*.ts` files or use the admin panel
2. **Change colors** — Edit `--color-brand-500` in `src/styles/global.css`
3. **Update branding** — Replace logo/name in Header and Footer components

See [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) for complete guide.

## Deployment

```bash
git push origin main  # Vercel auto-deploys on every push
```

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full instructions.

## Documentation

| Document | Description |
|---|---|
| [`docs/SETUP.md`](docs/SETUP.md) | Initial setup walkthrough |
| [`docs/ADMIN.md`](docs/ADMIN.md) | Admin panel usage guide |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Content management guide |
| [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) | Personalization guide |
| [`AI-SETUP-GUIDE.md`](AI-SETUP-GUIDE.md) | AI agent setup guide |

## License

[MIT License](LICENSE) — feel free to use this as a template for your own portfolio.

---

Built with ❤️ using [Astro](https://astro.build) + [Supabase](https://supabase.com) + [Cloudinary](https://cloudinary.com)