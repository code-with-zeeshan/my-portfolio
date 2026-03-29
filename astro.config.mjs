// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://yourname.dev", // Replace with your domain
  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["lucide-react", "motion"],
    },
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});