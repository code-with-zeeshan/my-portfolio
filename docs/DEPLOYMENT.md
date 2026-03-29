# Deployment Guide

## Vercel (Recommended)

### First Deployment

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete portfolio website"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click **"Add New Project"**

4. Select your `my-portfolio` repository

5. Vercel auto-detects Astro — leave all settings as default

6. Click **"Deploy"**

7. Your site is live at `your-project.vercel.app`

### Automatic Deployments

Every `git push` to `main` triggers a new deployment. Pull requests get preview URLs.

### Custom Domain

1. Purchase a domain from Namecheap, Cloudflare, or Porkbun
2. In Vercel: Project → Settings → Domains → Add
3. Follow DNS instructions (usually add an A record or CNAME)
4. Vercel provides free automatic HTTPS
5. Update `site` in `astro.config.mjs` to your new domain

### Environment Variables

If using Formspree or analytics, add variables in:
Vercel Dashboard → Project → Settings → Environment Variables

## Alternative Platforms

### Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

## Post-Deployment Checklist

- [ ] Site loads correctly at your domain
- [ ] Dark mode toggle works
- [ ] All navigation links work
- [ ] Contact form submits successfully
- [ ] Blog posts render correctly
- [ ] Mobile layout looks good
- [ ] Open Graph preview works (test at https://opengraph.xyz)
- [ ] Submit sitemap to Google Search Console