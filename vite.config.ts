import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTauri = !!process.env.TAURI_ENV_PLATFORM;
const tauriDevHost = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  // Tauri loads bundled files via a custom protocol — relative asset paths are required
  base: isTauri ? './' : '/',
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  resolve: isTauri
    ? {
        alias: {
          'virtual:pwa-register/react': path.resolve(
            __dirname,
            'src/lib/pwa-register-stub.ts',
          ),
        },
      }
    : undefined,
  server: {
    port: 5173,
    strictPort: true,
    host: tauriDevHost || false,
    hmr: tauriDevHost
      ? { protocol: 'ws', host: tauriDevHost, port: 1421 }
      : undefined,
  },
  build: isTauri
    ? {
        target:
          process.env.TAURI_ENV_PLATFORM === 'windows'
            ? 'chrome105'
            : 'safari13',
        // Vite 8 uses Oxc by default; explicit 'esbuild' requires a separate esbuild package
        minify: process.env.TAURI_ENV_DEBUG ? false : true,
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
      }
    : undefined,
  plugins: [
    react(),
    VitePWA({
      disable: isTauri,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons.svg'],
      pwaAssets: {
        config: true,
      },
      manifest: {
        name: 'Enzo — Enculture AI Assistant',
        short_name: 'Enzo',
        description:
          'Enzo is your conversational employee assistant for the Enculture platform. Check tasks, view details, get daily insights, and chat with AI.',
        theme_color: '#16181d',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['productivity', 'business'],
        lang: 'en',
        dir: 'ltr',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
