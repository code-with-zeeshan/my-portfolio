// src/lib/config.ts
// Single source of truth for all site URLs
// Works with Vercel preview URLs, custom domains, and localhost

export const siteConfig = {
    // This resolves in order:
    // 1. Custom domain from env var (production)
    // 2. Vercel auto-URL (preview deployments)
    // 3. Localhost (development)
    get url(): string {
      if (typeof import.meta.env !== "undefined") {
        // Custom domain set in Vercel env vars
        if (import.meta.env.PUBLIC_SITE_URL) {
          return import.meta.env.PUBLIC_SITE_URL;
        }
        // Vercel auto-provides this for every deployment
        if (import.meta.env.SITE) {
          return import.meta.env.SITE;
        }
      }
      return "https://my-portfolio-gamma-six-70.vercel.app";
    },
  
    name: "Mohammad Zeeshan",
    title: "Full-Stack Developer",
    description: "Full-Stack Developer — Building modern web experiences",
    ogImage: "/og-image.png",
  } as const;