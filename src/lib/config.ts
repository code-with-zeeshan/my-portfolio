// src/lib/config.ts
// Single source of truth for all site URLs
// Works with Vercel preview URLs, custom domains, and localhost

export const siteConfig = {
    // This resolves in order:
    // 1. Custom domain from env var (production)
    // 2. Vercel auto-URL (preview deployments)
    // 3. Empty string if not configured (should be set in .env)
    get url(): string {
      if (typeof import.meta.env !== "undefined") {
        if (import.meta.env.PUBLIC_SITE_URL) {
          return import.meta.env.PUBLIC_SITE_URL;
        }
        if (import.meta.env.SITE) {
          return import.meta.env.SITE;
        }
      }
      return "";
    },
  
    name: "Mohammad Zeeshan",
    title: "Full-Stack Developer",
    description: "Full-Stack Developer — Building modern web experiences",
    ogImage: "/og-image.png",
  } as const;