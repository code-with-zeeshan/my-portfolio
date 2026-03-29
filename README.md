# 🚀 Personal Portfolio Website

A modern, minimalist, and responsive portfolio website built with **Astro 6**, **TypeScript**, **Tailwind CSS v4**, and **React 19**.

![Astro](https://img.shields.io/badge/Astro-6.1-purple?style=flat-square&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=flat-square&logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **Blazing Fast** — Astro's island architecture ships zero JavaScript by default
- **Dark/Light Mode** — Toggle with localStorage persistence and system preference detection
- **Responsive Design** — Mobile-first layouts that look great on all devices
- **Animated Sections** — SSR-safe scroll animations using IntersectionObserver + CSS transitions
- **Blog with MDX** — Write blog posts in Markdown/MDX with syntax highlighting
- **Project Showcase** — Featured project carousel and card grid with case studies
- **Contact Form** — Ready for Formspree or Web3Forms integration
- **SEO Optimized** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigation, color contrast

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Astro 6](https://astro.build) | Static site framework with island architecture |
| [TypeScript](https://typescriptlang.org) | Type-safe JavaScript |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework |
| [React 19](https://react.dev) | Interactive UI components (islands) |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component library |
| [MDX](https://mdxjs.com) | Markdown with JSX for blog posts |
| [Vercel](https://vercel.com) | Hosting and deployment |

## 📁 Project Structure

```text
my-portfolio/
├── public/                        # Static assets (images, resume, favicon)
│   ├── images/
│   │   ├── profile.webp           # Profile photo
│   │   └── projects/              # Project screenshots
│   ├── favicon.svg
│   ├── og-image.png               # Social share image (1200×630)
│   ├── resume.pdf
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── layout/                # Header, Footer, ThemeToggle, MobileNav
│   │   ├── react/                 # Interactive React island components
│   │   │   ├── FadeIn.tsx         # Scroll-triggered fade animation
│   │   │   ├── AnimatedCard.tsx   # Project card with reveal animation
│   │   │   ├── ContactForm.tsx    # Contact form with submission states
│   │   │   ├── TextReveal.tsx     # Word-by-word text reveal
│   │   │   ├── SkillBar.tsx       # Animated progress bars
│   │   │   ├── StaggerChildren.tsx # Staggered child animations
│   │   │   ├── MagneticHover.tsx  # Cursor-following hover effect
│   │   │   ├── ProjectCarousel.tsx # Featured project slider
│   │   │   ├── ScrollProgress.tsx # Page scroll progress bar
│   │   │   └── PageTransition.tsx # Page load fade-in
│   │   ├── sections/              # Page sections (Hero, About, Projects, etc.)
│   │   └── ui/
│   │       ├── Icons.astro        # SVG icon system for .astro files
│   │       └── *.tsx              # shadcn/ui components
│   │
│   ├── content.config.ts          # Astro 6 Content Collection schemas
│   ├── data/
│   │   ├── blog/                  # MDX blog posts
│   │   ├── projects/              # MDX project case studies
│   │   ├── personal.ts            # Personal info (name, bio, links)
│   │   ├── projects.ts            # Project data
│   │   ├── skills.ts              # Skills data
│   │   └── experience.ts          # Work experience data
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Main HTML shell with SEO
│   │   └── BlogLayout.astro       # Blog post layout
│   │
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn, formatDate)
│   │
│   ├── pages/
│   │   ├── index.astro            # Home page (all sections)
│   │   ├── about.astro            # About page
│   │   ├── 404.astro              # Custom 404 page
│   │   ├── blog/
│   │   │   ├── index.astro        # Blog listing
│   │   │   └── [...slug].astro    # Individual blog posts
│   │   └── projects/
│   │       ├── index.astro        # Projects listing
│   │       └── [...slug].astro    # Individual project pages
│   │
│   └── styles/
│       └── global.css             # Tailwind imports + design tokens
│
├── docs/                          # Project documentation
├── astro.config.mjs               # Astro configuration
├── tsconfig.json                  # TypeScript configuration
├── components.json                # shadcn/ui configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** (required by Astro 6)
- **npm** (comes with Node.js)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Type-check and build for production to `./dist/` |
| `npm run preview` | Preview production build locally |

## 🎨 Customization

### Personal Information

Edit `src/data/personal.ts` with your details:

```typescript
export const personal = {
  name: "Your Name",
  title: "Your Title",
  tagline: "Your tagline here.",
  bio: "Your bio here.",
  location: "Your City, Country",
  email: "you@email.com",
  availability: "Open to opportunities",
  socials: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://x.com/yourusername",
  },
};
```

### Projects, Skills, Experience

| File | What to Edit |
|---|---|
| `src/data/projects.ts` | Your projects (title, description, tags, URLs) |
| `src/data/skills.ts` | Your skill categories and technologies |
| `src/data/experience.ts` | Your work experience |

### Blog Posts

Add `.mdx` files to `src/data/blog/`:

```mdx
---
title: "Your Post Title"
description: "Brief description."
pubDate: "2026-04-01"
tags: ["Tag1", "Tag2"]
draft: false
---

Your content here with **Markdown** and MDX support.
```

### Theme Colors

Edit the brand color in `src/styles/global.css`:

```css
@theme {
  --color-brand-500: oklch(0.60 0.16 260);  /* Change 260 to rotate hue */
}
```

| Hue Value | Color |
|---|---|
| `260` | Purple/Indigo (default) |
| `220` | Blue |
| `160` | Green |
| `30` | Orange |
| `350` | Pink/Red |

### Contact Form

Replace `YOUR_FORM_ID` in `src/components/react/ContactForm.tsx`:

1. Sign up at [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
2. Create a form and get your endpoint URL
3. Replace the fetch URL in `ContactForm.tsx`

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Astro — click "Deploy"
5. (Optional) Add a custom domain in Project Settings → Domains

### Custom Domain

1. Purchase a domain (Namecheap, Cloudflare, Porkbun)
2. Add it in Vercel Dashboard → Project → Settings → Domains
3. Update DNS records as instructed
4. Update `site` in `astro.config.mjs`

## 📊 Performance

Target Lighthouse scores:

| Metric | Target |
|---|---|
| Performance | 95+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 100 |

## 🏗 Architecture Decisions

### Why Astro?

Astro ships zero JavaScript by default. Interactive components (React) are loaded only where needed using Astro's island architecture (`client:load`, `client:visible`).

### Why Not Framer Motion?

Framer Motion (now "Motion") has SSR compatibility issues with Astro's server rendering. All animations use native `IntersectionObserver` + CSS transitions — achieving the same visual results with zero bundle size impact.

### Why Inline SVG Icons?

`lucide-react` imports fail during Astro's SSR pass in `.astro` files. The custom `Icons.astro` component renders pure SVG with zero JavaScript, while `.tsx` React components can still use `lucide-react` where React hydration is available.

### Dark Mode Strategy

Tailwind CSS v4 defaults to `@media (prefers-color-scheme)` for dark mode. This project uses `@custom-variant dark (&:where(.dark, .dark *))` to enable class-based toggling via JavaScript, with `localStorage` persistence.

## 📄 License

MIT License — feel free to use this as a template for your own portfolio.

---

Built with ❤️ using [Astro](https://astro.build)