// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://desvosoft.github.io',
  base: '/HelloWorld/',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [sitemap()]
});
