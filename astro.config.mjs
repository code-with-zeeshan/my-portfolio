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
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
  },

  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});
