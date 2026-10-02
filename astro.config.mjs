// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://dentista-dalila.vercel.app',
  // La página pública se prerenderiza; solo /panel y las Actions corren bajo demanda.
  adapter: vercel(),
  env: {
    // Opcionales para que el sitio compile sin Supabase (las citas caen a WhatsApp).
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_ANON_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 1.0,
      lastmod: new Date(),
      filter: (page) => !page.includes('/panel'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
