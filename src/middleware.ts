// src/middleware.ts
// Security headers middleware - adds CSP and other security headers
import { defineMiddleware } from "astro:middleware";

// Build CSP based on environment variables
function buildCSP(isAdminRoute: boolean, isDev: boolean): string {
  const directives: string[] = [];

  // Default source
  directives.push("default-src 'self'");

  // Script sources
  const scriptSrc = [
    "'self'",
    // Astro generates inline hydration/React scripts at build time.
    // These cannot be nonce'd, so 'unsafe-inline' is required.
    "'unsafe-inline'",
  ];

  // In development, also allow blob: and unsafe-eval for Vite
  if (isDev) {
    scriptSrc.push("blob:");
    scriptSrc.push("'unsafe-eval'");
  }

  // Add environment-specific sources
  if (process.env.PUBLIC_CLOUDINARY_CLOUD_NAME) {
    scriptSrc.push("https://res.cloudinary.com", "https://*.cloudinary.com");
  }

  if (process.env.PUBLIC_SUPABASE_URL) {
    const supabaseHost = new URL(process.env.PUBLIC_SUPABASE_URL).hostname;
    scriptSrc.push(`https://${supabaseHost}`);
  }

  if (process.env.PUBLIC_PLAUSIBLE_API_HOST) {
    scriptSrc.push(process.env.PUBLIC_PLAUSIBLE_API_HOST);
  }

  if (process.env.PUBLIC_POSTHOG_API_KEY) {
    scriptSrc.push("https://*.posthog.com");
    scriptSrc.push("https://us-assets.i.posthog.com");
  }

  if (process.env.PUBLIC_UMAMI_URL) {
    scriptSrc.push(process.env.PUBLIC_UMAMI_URL);
  }

  // CDN for libraries + Vercel analytics
  scriptSrc.push("https://cdn.jsdelivr.net");
  scriptSrc.push("https://va.vercel-scripts.com");
  scriptSrc.push("https://us-assets.i.posthog.com");


  directives.push(`script-src ${scriptSrc.join(" ")}`);

  // Style sources
  const styleSrc = [
    "'self'",
    // Astro generates inline styles at build time.
    // These cannot be nonce'd, so 'unsafe-inline' is required.
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ];

  directives.push(`style-src ${styleSrc.join(" ")}`);

  // Image sources
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https:",
  ];
  if (process.env.PUBLIC_CLOUDINARY_CLOUD_NAME) {
    imgSrc.push("https://res.cloudinary.com", "https://*.cloudinary.com");
  }
  directives.push(`img-src ${imgSrc.join(" ")}`);

  // Font sources
  directives.push("font-src 'self' data: https://fonts.gstatic.com");

  // Connect sources
  const connectSrc = [
    "'self'",
    "https:",
    "http:",
  ];
  if (process.env.PUBLIC_SUPABASE_URL) {
    const supabaseHost = new URL(process.env.PUBLIC_SUPABASE_URL).hostname;
    connectSrc.push(`https://${supabaseHost}`);
  }
  if (process.env.PUBLIC_PLAUSIBLE_API_HOST) {
    connectSrc.push(process.env.PUBLIC_PLAUSIBLE_API_HOST);
  }
  if (process.env.PUBLIC_POSTHOG_API_KEY) {
    connectSrc.push("https://*.posthog.com");
  }
  if (process.env.PUBLIC_UMAMI_URL) {
    connectSrc.push(process.env.PUBLIC_UMAMI_URL);
  }
  directives.push(`connect-src ${connectSrc.join(" ")}`);
  
  // Worker sources (for blob workers used by Vite)
  const workerSrc = [
    "'self'",
    "blob:",
  ];
  directives.push(`worker-src ${workerSrc.join(" ")}`);
  
  // Frame sources
  const frameSrc = ["'self'", "https:", "http:"];
  directives.push(`frame-src ${frameSrc.join(" ")}`);

  // Other directives
  directives.push("object-src 'none'");
  directives.push("base-uri 'self'");
  directives.push("form-action 'self'");
  
  // Admin routes: stricter policy
  if (isAdminRoute) {
    directives.push("frame-ancestors 'none'");
  }

  return directives.join("; ");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  const url = new URL(request.url);

  // Skip CSP for API routes and non-HTML responses
  const isApiRoute = url.pathname.startsWith("/api/");
  const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|json|txt|xml|pdf)$/i.test(url.pathname);
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isDev = import.meta.env.DEV;

  const response = await next();

  if (!isApiRoute && !isAsset) {
    // Build CSP with environment variables (no hardcoded URLs)
    const csp = buildCSP(isAdminRoute, isDev);
    
    // Set CSP header with nonce
    response.headers.set("Content-Security-Policy", csp);
  }

  // Additional security headers (apply to all responses)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  return response;
});
