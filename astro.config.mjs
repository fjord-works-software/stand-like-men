// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://YOUR_GITHUB_USERNAME.github.io',
  // base: '/stand-like-men', // uncomment if deploying to a sub-path repo
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});