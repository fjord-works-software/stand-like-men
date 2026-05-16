// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const BASE = (process.env.BASE_PATH || '/').replace(/\/+$/, '') + '/';

export default defineConfig({
  site: 'https://standlikemen.com',
  base: BASE,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});