# Setup Guide

## Prerequisites

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 22.0.0+ | `node -v` |
| npm | 10.0.0+ | `npm -v` |
| Git | 2.0+ | `git -v` |

## Fresh Setup

```bash
# 1. Clone
git clone https://github.com/code-with-zeeshan/my-portfolio.git
cd my-portfolio

# 2. Install dependencies
npm install

# 3. Start development
npm run dev
# → http://localhost:4321

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

## Environment Variables (Optional)

Create a `.env` file in the project root if needed:

```env
# Contact Form (Formspree)
PUBLIC_FORM_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID

# Analytics (Plausible)
PUBLIC_PLAUSIBLE_DOMAIN=yourname.dev
```

## Troubleshooting

### `astro dev` fails with Node.js error

Astro 6 requires Node.js 22+. Update Node.js:

```bash
# Using nvm
nvm install 22
nvm use 22
```

### Styles not updating

Clear Astro and Vite caches:

```bash
rm -rf .astro node_modules/.vite
npm run dev
```

### Content not appearing

After editing `src/content.config.ts` or adding/removing MDX files, restart the dev server.