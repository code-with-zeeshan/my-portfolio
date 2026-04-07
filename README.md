# 🚀 Personal Portfolio Website

A modern, full-stack portfolio website built with **Astro 6**, **React 18**, **Tailwind CSS v4**, **Supabase**, and **Cloudinary** — featuring a hidden admin dashboard for live content management.

![Astro](https://img.shields.io/badge/Astro-6.1-purple?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=flat-square&logo=tailwindcss)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448c5?style=flat-square&logo=cloudinary)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **Blazing Fast** — Astro's island architecture ships zero JavaScript by default
- **Dark/Light Mode** — Toggle with localStorage persistence and system preference detection
- **Responsive Design** — Mobile-first layouts that look great on all devices
- **Animated Sections** — SSR-safe scroll animations using IntersectionObserver + CSS transitions
- **Blog with MDX** — Write blog posts in Markdown/MDX with syntax highlighting
- **Project Showcase** — Featured project carousel and card grid with case studies
- **Dynamic Content** — All sections fetch live data from Supabase with static fallbacks
- **Hidden Admin Panel** — Full CRUD dashboard accessible via `Ctrl+Shift+A`
- **Cloudinary CDN** — Auto-optimized images (WebP/AVIF, responsive sizing)
- **Contact Form** — Messages saved to Supabase inbox, readable in admin panel
- **Resume Management** — Upload and update resume PDF via admin; auto-downloads for visitors
- **SEO Optimized** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation, color contrast

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Astro 6](https://astro.build) | Static site framework with island architecture |
| [TypeScript](https://typescriptlang.org) | Type-safe JavaScript |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework |
| [React 18](https://react.dev) | Interactive UI components (islands) |
| [Supabase](https://supabase.com) | PostgreSQL database, authentication, storage |
| [Cloudinary](https://cloudinary.com) | CDN image delivery and optimization |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component library (Base UI) |
| [MDX](https://mdxjs.com) | Markdown with JSX for blog posts |
| [Vercel](https://vercel.com) | Hosting and deployment |

## 📁 Project Structure

```text
my-portfolio/
├── public/                        # Static assets
│   ├── images/
│   │   ├── profile.webp           # Profile photo fallback
│   │   └── projects/              # Project screenshot fallbacks
│   ├── favicon.svg
│   ├── og-image.png               # Social share image (1200×630)
│   ├── resume.pdf                 # Resume fallback (override via admin)
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro       # Fixed navbar with resume button
│   │   │   ├── Footer.astro       # Footer with social links
│   │   │   ├── MobileNav.tsx      # Mobile hamburger menu
│   │   │   └── ThemeToggle.tsx    # Dark/light mode toggle
│   │   │
│   │   ├── react/
│   │   │   ├── sections/          # Dynamic sections (fetch from Supabase)
│   │   │   │   ├── DynamicHero.tsx
│   │   │   │   ├── DynamicAbout.tsx
│   │   │   │   ├── DynamicProjects.tsx
│   │   │   │   ├── DynamicProjectsIndex.tsx
│   │   │   │   ├── DynamicProjectPage.tsx
│   │   │   │   ├── DynamicSkills.tsx
│   │   │   │   ├── DynamicExperience.tsx
│   │   │   │   ├── DynamicTestimonials.tsx
│   │   │   │   ├── DynamicBlogPreview.tsx
│   │   │   │   ├── DynamicBlogIndex.tsx
│   │   │   │   ├── DynamicBlogPost.tsx
│   │   │   │   └── DynamicContact.tsx
│   │   │   ├── AdminDashboard.tsx # Full CMS dashboard
│   │   │   ├── AdminGate.tsx      # Hidden login modal (Ctrl+Shift+A)
│   │   │   ├── CloudinaryImage.tsx # Optimized image component
│   │   │   ├── CloudinaryUpload.tsx # Drag & drop upload widget
│   │   │   ├── ContactForm.tsx    # Contact form → Supabase messages
│   │   │   ├── FadeIn.tsx         # Scroll-triggered fade animation
│   │   │   ├── MagneticHover.tsx  # Cursor-following hover effect
│   │   │   ├── PageTransition.tsx # Page load fade-in (used in BlogLayout)
│   │   │   ├── ReactIcon.tsx      # SVG icon system for .tsx files
│   │   │   ├── ResumeButton.tsx   # Resume link (fetches URL from Supabase)
│   │   │   ├── ScrollProgress.tsx # Page scroll progress bar
│   │   │   ├── SkillBar.tsx       # Animated progress bars
│   │   │   ├── StaggerChildren.tsx # Staggered child animations
│   │   │   └── TextReveal.tsx     # Word-by-word text reveal
│   │   │
│   │   └── ui/
│   │       ├── Icons.astro        # SVG icon system for .astro files
│   │       └── *.tsx              # shadcn/ui components (Base UI)
│   │
│   ├── content.config.ts          # Astro Content Collection schemas
│   │
│   ├── data/                      # Static fallback data
│   │   ├── blog/                  # MDX blog posts
│   │   ├── projects/              # MDX project case studies
│   │   ├── personal.ts            # Personal info fallback
│   │   ├── projects.ts            # Projects fallback
│   │   ├── skills.ts              # Skills fallback
│   │   ├── experience.ts          # Experience fallback
│   │   └── testimonials.ts        # Testimonials fallback
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Main HTML shell with SEO meta
│   │   ├── BlogLayout.astro       # Blog post layout with PageTransition
│   │   └── AdminLayout.astro      # Admin-only layout (noindex)
│   │
│   ├── lib/
│   │   ├── cloudinary.ts          # Upload, delete, URL optimization helpers
│   │   ├── config.ts              # Site URL config
│   │   ├── data.ts                # Supabase fetch helpers with fallbacks
│   │   ├── supabase.ts            # Supabase clients (public + admin)
│   │   ├── syncFallbackData.ts    # One-time static → Supabase sync
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   └── utils.ts               # cn(), formatDate(), readingTime()
│   │
│   ├── pages/
│   │   ├── index.astro            # Home (all Dynamic* sections)
│   │   ├── about.astro            # About page (Dynamic* sections)
│   │   ├── 404.astro              # Custom 404 page
│   │   ├── admin/
│   │   │   └── index.astro        # Admin dashboard (SSR, auth-gated)
│   │   ├── api/
│   │   │   └── sync.ts            # POST /api/sync — seed Supabase from static data
│   │   ├── blog/
│   │   │   ├── index.astro        # Blog listing (DynamicBlogIndex)
│   │   │   └── [...slug].astro    # Static MDX blog posts
│   │   └── projects/
│   │       ├── index.astro        # Projects listing (DynamicProjectsIndex)
│   │       └── [id].astro         # Dynamic project pages (Supabase UUID)
│   │
│   └── styles/
│       └── global.css             # Tailwind imports + design tokens
│
├── docs/                          # Project documentation
│   ├── ADMIN.md                   # Admin panel usage guide
│   ├── ANIMATIONS.md              # Animation system reference
│   ├── CONTENT.md                 # Content management guide
│   ├── CUSTOMIZATION.md           # How to personalize the portfolio
│   ├── DEPLOYMENT.md              # Deployment instructions
│   └── SETUP.md                   # Initial setup guide
│
├── .env.example                   # Environment variable template
├── astro.config.mjs               # Astro + Vite configuration
├── components.json                # shadcn/ui configuration
├── tsconfig.json                  # TypeScript configuration
├── vercel.json                    # Vercel routing rules
└── package.json
```

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 22.0.0+ |
| npm | 10.0.0+ |
| Git | 2.0+ |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your Supabase and Cloudinary credentials

# 4. Start development server
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

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` has no `PUBLIC_` prefix — it is server-only and never exposed to the browser.

See [`docs/SETUP.md`](docs/SETUP.md) for the full setup walkthrough.

## 🏗 Architecture

### Data Flow

```
Static files (src/data/*.ts)
       ↓ fallback if Supabase unreachable
Supabase PostgreSQL ←→ Admin Dashboard (Ctrl+Shift+A)
       ↓
Dynamic* React components (client:visible)
       ↓
Portfolio pages
```

### Why Two Icon Systems?

| File | Used In | Why |
|---|---|---|
| `Icons.astro` | `.astro` files only | Pure SVG — zero JS, SSR-safe |
| `ReactIcon.tsx` | `.tsx` files only | React component — required for React rendering context |

You **cannot** import `Icons.astro` in `.tsx` files — Astro components run server-side only and cannot cross into React's client-side rendering boundary.

### Why Not Framer Motion?

Framer Motion has SSR compatibility issues with Astro's server rendering. All animations use native `IntersectionObserver` + CSS transitions — achieving the same visual results with zero SSR errors and minimal bundle size.

### Dark Mode Strategy

Uses `@custom-variant dark (&:where(.dark, .dark *))` in Tailwind v4 for class-based toggling, with `localStorage` persistence and system preference detection on first visit.

## 🎨 Customization

1. **Edit content** — Update `src/data/*.ts` files or use the admin panel
2. **Change colors** — Edit `--color-brand-500` hue in `src/styles/global.css`
3. **Update branding** — Replace `YN.` in `Header.astro` and `Footer.astro`
4. **Add images** — Drop into `public/images/` or upload via admin Cloudinary integration

See [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) for the complete guide.

## 🌐 Deployment

Recommended: **Vercel** (auto-detects Astro, free tier available)

```bash
git push origin main  # Vercel auto-deploys on every push
```

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full instructions including custom domains.

## 📊 Performance Targets

| Metric | Target |
|---|---|
| Performance | 95+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 100 |

## 📄 License

[MIT License](LICENSE) — feel free to use this as a template for your own portfolio.

## 🔜 PHASE 3 Roadmap
```
├── Rich text / Markdown editor for blog posts
├── Drag-and-drop mutiple image uploads
├── Preview before publish
├── Analytics dashboard in admin
├── Blog post scheduling (future publish dates)
└── SEO metadata editor per page 
```
---

Built with ❤️ using [Astro](https://astro.build) + [Supabase](https://supabase.com) + [Cloudinary](https://cloudinary.com)