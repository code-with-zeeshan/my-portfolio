// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://my-portfolio-gamma-six-70.vercel.app",
  
  adapter: vercel(),
  
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Force Vite to use ONE copy of React across all dependencies
      dedupe: ["react", "react-dom", "react-dom/server", "react/jsx-runtime"],
    },
    ssr: {
      // Bundle these instead of treating them as external CJS modules
      noExternal: [
        "lucide-react",
        "motion",
        "@supabase/supabase-js",
      ],
    },
    optimizeDeps: {
      // Pre-bundle React to prevent duplicate instances
      include: ["react", "react-dom", "react-dom/server"],
    },
  },

  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});