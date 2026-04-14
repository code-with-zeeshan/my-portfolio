# Deployment Guide

## Vercel (Recommended)

### First Deployment

```bash
git add .
git commit -m "feat: complete portfolio website"
git push origin main
```

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **Add New Project** → select `my-portfolio`
3. Vercel auto-detects Astro — click **Deploy**
4. Site is live at `your-project.vercel.app`

### Environment Variables

In Vercel: **Project → Settings → Environment Variables**

| Variable | Value | Required |
|---|---|---|
| `PUBLIC_SITE_URL` | `https://yourdomain.com` | For custom domain |
| `PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | ✅ Yes |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | ✅ Yes |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | ✅ Yes |
| `PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `portfolio_unsigned` | ✅ Yes |
| `PUBLIC_CLOUDINARY_API_KEY` | `your_api_key` | ✅ Yes |
| `CRON_SECRET` | `your_random_secret_string` | For scheduled posts |
| `PUBLIC_ANALYTICS_PROVIDER` | `plausible` | Optional |
| `PUBLIC_PLAUSIBLE_DOMAIN` | `yourdomain.com` | If using Plausible |
| `PUBLIC_PLAUSIBLE_API_KEY` | `your_plausible_api_key` | If using Plausible |

> ⚠️ Set all variables for **Production**, **Preview**, and **Development** environments.

### Custom Domain

1. Purchase a domain (Namecheap, Cloudflare, Porkbun)
2. Vercel → Project → Settings → Domains → **Add**
3. Follow DNS instructions (A record or CNAME)
4. Vercel provides free automatic HTTPS
5. Update `PUBLIC_SITE_URL` in Vercel environment variables
6. Redeploy (or wait for next push)

### Automatic Deployments

Every `git push origin main` triggers a new production deployment.
Pull requests automatically get preview URLs.

## Alternative Platforms

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

## Post-Deployment Checklist

- [ ] Site loads at your domain
- [ ] Dark mode toggle works and persists
- [ ] All nav links work correctly
- [ ] `Ctrl+Shift+A` opens login modal
- [ ] Admin panel loads after login
- [ ] Contact form submits (check Admin → Messages)
- [ ] Resume download triggers file save
- [ ] Blog posts load
- [ ] Project pages load
- [ ] Mobile layout looks correct
- [ ] OG preview correct (test at [opengraph.xyz](https://opengraph.xyz))
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)